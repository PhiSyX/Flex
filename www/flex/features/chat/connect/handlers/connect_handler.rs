// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientSocketInterface, Origin, Socket};
use flex_chat_user::{UserInterface, UserOperatorInterface};
use flex_crypto::Hasher;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::types::time;
use flex_web_framework::types::time::TimeZone;
use socketioxide::extract::{SocketRef, State, TryData};

use super::{UNickHandler, UserHandler};
use crate::config::chat::FlexChatConfig;
use crate::features::chat::connect::{
	ConnectClientSocketCommandResponseInterface,
	RememberUserFormData,
	UserClientSocketInterface,
};
use crate::features::chat::{
	ConnectApplicationInterface,
	OperApplicationInterface,
	OperClientSocketCommandResponse,
	PassHandler,
	QuitHandler,
	SilenceClientSocketInterface,
	SilenceClientsSessionInterface,
	TokenController,
};
use crate::features::ChatApplication;
use crate::FlexApplicationState;

// --------- //
// Structure //
// --------- //

pub struct ConnectionRegistrationHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ConnectionRegistrationHandler
{
	/// Événement CONNECT
	pub fn handle_connect(
		socket: &SocketRef,
		State(server_state): State<FlexApplicationState>,
		State(app): State<ChatApplication>,
		TryData(data): TryData<RememberUserFormData>,
	)
	{
		let maybe_user_id = data.as_ref().cloned().ok().and_then(|d| d.user_id);
		let maybe_client_id = data.as_ref().cloned().ok().and_then(|d| d.client_id);

		let new_client = || {
			let client = if let Some(user_id) = maybe_user_id {
				app.create_client_with_id(socket, user_id)
			} else {
				app.create_client(socket)
			};

			socket.extensions.insert(client);

			// NOTE(phisyx): ces événements ne peuvent être envoyés qu'à la
			//               connexion, pour l'enregistrement d'un nouveau
			//               client, pas pour un client déjà existant lors
			//               d'une reconnexion.
			socket.on(PassHandler::COMMAND_NAME, PassHandler::handle);
			socket.on(UserHandler::COMMAND_NAME, UserHandler::handle);
			socket.on(UNickHandler::COMMAND_NAME, UNickHandler::handle);
		};

		let already_existing_client = |mut client_socket: Socket| {
			client_socket.client_mut().reconnect_with_new_sid(socket.id);
			Self::complete_registration(server_state, app, client_socket);
		};

		let cookie_manager = socket
			.req_parts()
			.extensions
			.get::<flex_web_framework::http::TowerCookies>()
			.map(|cm| {
				flex_web_framework::http::Cookies::new(
					cm.clone(),
					server_state.get_cookie_key().clone(),
				)
				.with_cookie_settings(server_state.get_cookie_settings().clone())
			})
			.expect("Cookie manager");

		let token = cookie_manager
			.signed()
			.get(TokenController::COOKIE_TOKEN_KEY);

		socket.on_disconnect(QuitHandler::handle_disconnect);

		let Some(client) = (if let Some((user_id, token)) = maybe_user_id.zip(token.clone()) {
			app.get_client_by_user_id_and_token(&user_id, token.value())
		} else if let Some((remember_client_id, token)) = maybe_client_id.zip(token) {
			app.get_client_by_id_and_token(&remember_client_id, token.value())
		} else {
			new_client();
			return;
		}) else {
			new_client();
			return;
		};

		socket.extensions.insert(client.clone());
		let client_socket = app.current_client_mut(socket);
		already_existing_client(client_socket);
	}

	/// Compléter l'enregistrement d'un client.
	pub fn complete_registration(
		_server_state: &FlexApplicationState,
		app: &ChatApplication,
		mut client_socket: Socket,
	) -> Option<()>
	{
		if client_socket.user().nickname().is_empty() || client_socket.user().ident().is_empty() {
			return Some(());
		}

		let config = client_socket
			.socket()
			.req_parts()
			.extensions
			.get::<FlexChatConfig>()?
			.clone();

		if config.server.password.is_some() && client_socket.user().server_password().is_none() {
			// FIXME(phisyx): à déplacer
			_ = client_socket.socket().emit(
				"ERROR",
				"La commande `PASS <password>` DOIT être envoyée avant toutes les autres \
				 commandes.",
			);
			return None;
		}

		if let Some((server_password, client_password)) = config
			.server
			.password
			.as_deref()
			.zip(client_socket.user().server_password_exposed())
		{
			let password_hasher = client_socket
				.socket()
				.req_parts()
				.extensions
				.get::<Argon2Password>()
				.expect("Le service de chiffrement Argon2.");

			if !password_hasher.cmp(server_password, client_password) {
				// FIXME(phisyx): à déplacer
				_ = client_socket.socket().emit(
					"ERROR",
					"Le mot de passe entrée ne correspond pas avec le mot de passe serveur.",
				);
				return None;
			}
		}

		//
		// NOTE(phisyx): Enregistrer le client dans la session.
		//

		if !client_socket.client().is_registered() && client_socket.client().is_disconnected() {
			if !app.can_locate_unregistered_client(client_socket.client()) {
				return None;
			}

			client_socket.client_mut().set_connected();
			client_socket.client_mut().set_registered();
			app.register_client(client_socket.client());
		} else if client_socket.client().is_registered() && client_socket.client().is_disconnected()
		{
			client_socket.client_mut().set_connected();
			app.register_client(client_socket.client());
		}

		_ = client_socket
			.socket()
			.join(client_socket.client().private_room());

		//
		// NOTE(phisyx): Émettre au client les messages de connexions.
		//

		// Welcome
		client_socket.send_rpl_welcome();
		// Version
		client_socket.send_rpl_yourhost(&config.server.name);
		// Server creation info
		client_socket.send_rpl_created(if let Some(server_created_at) = config.server.created_at {
			time::Utc.timestamp_opt(server_created_at, 0).unwrap()
		} else {
			time::Utc::now()
		});

		// NOTE(phisyx): transmet à l'utilisateur ses modes utilisateurs.
		client_socket.emit_all_user_modes();

		// NOTE(phisyx): transmet à l'utilisateur son rôle d'opérateur global.
		if client_socket.user().is_operator() {
			client_socket.send_rpl_youreoper(client_socket.user().operator_type().unwrap());
			for channel_name in config.operator.auto_join.iter() {
				app.join_or_create_oper_channel(&client_socket, channel_name);
			}
		}

		// NOTE(phisyx): transmet les utilisateurs bloqués/ignorés du client (au
		// client lui-même ;-))
		let users: Vec<_> = app
			.clients
			.blocklist(client_socket.cid())
			.iter()
			.map(Origin::from)
			.collect();
		if !users.is_empty() {
			for user in users.iter() {
				_ = client_socket.socket().join(format!("{}/ignore", &user.id));
			}
			let users: Vec<_> = users.iter().collect();
			client_socket.emit_silence(&users, None);
		}

		Some(())
	}
}
