// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_crypto::{Argon2Encryption, Encryption};
use flex_web_framework::security::SecurityEncryptionService;
use flex_web_framework::types::time;
use flex_web_framework::types::time::TimeZone;
use socketioxide::extract::{SocketRef, State, TryData};

use crate::config::flex::flex_config;
use crate::src::chat::components;
use crate::src::chat::features::*;
use crate::src::chat::replies::*;
use crate::src::ChatApplication;

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
		State(app): State<ChatApplication>,
		TryData(data): TryData<super::RememberUserFormData>,
	)
	{
		let new_client = || {
			let client = app.create_client(socket);

			socket.extensions.insert(client);

			// NOTE(phisyx): ces événements ne peuvent être envoyés qu'à la
			//               connexion, pour l'enregistrement d'un nouveau
			//               client, pas pour un client déjà existant lors
			//               d'une reconnexion.
			socket.on(PassHandler::COMMAND_NAME, PassHandler::handle);
			socket.on(UserHandler::COMMAND_NAME, UserHandler::handle);
			socket.on(
				NickHandler::UNREGISTERED_COMMAND_NAME,
				NickHandler::handle_unregistered,
			);
		};

		let already_existing_client = |mut client: components::Client| {
			client.reconnect_with_new_sid(socket.id);
			socket.extensions.insert(client.clone());
			Self::complete_registration(socket, app, &mut client);
		};

		if let Some(remember_client_id) = data.ok().and_then(|data| data.client_id) {
			if let Some(client) = app.find_client(&remember_client_id) {
				already_existing_client(client);
			} else {
				new_client();
			}
		} else {
			new_client();
		}

		socket.on_disconnect(QuitHandler::handle_disconnect);
	}

	/// Compléter l'enregistrement d'un client.
	pub fn complete_registration(
		socket: &SocketRef,
		app: &ChatApplication,
		client: &mut components::Client,
	) -> Option<()>
	{
		if client.user().nickname.is_empty() || client.user().ident.is_empty() {
			return Some(());
		}

		let config = socket.req_parts().extensions.get::<flex_config>()?;

		if config.server.password.is_some() && client.user().pass.is_none() {
			// FIXME(phisyx): à déplacer
			_ = socket.emit(
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
			.zip(client.user().pass.as_deref())
		{
			let security_encryption = socket
				.req_parts()
				.extensions
				.get::<SecurityEncryptionService<Argon2Encryption>>()
				.expect("Le service de chiffrement Argon2.");

			if !security_encryption.cmp(server_password, client_password) {
				// FIXME(phisyx): à déplacer
				_ = socket.emit(
					"ERROR",
					"Le mot de passe entrée ne correspond pas avec le mot de passe serveur.",
				);
				return None;
			}
		}

		//
		// NOTE(phisyx): Enregistrer le client dans la session.
		//

		if !client.is_registered() && client.is_disconnected() {
			if !app.can_locate_unregistered_client(client) {
				return None;
			}

			client.set_connected();
			client.set_registered();
			app.register_client(client);
		} else if client.is_registered() && client.is_disconnected() {
			client.set_connected();
			app.register_client(client);
		}

		_ = socket.join(client.private_room());

		//
		// NOTE(phisyx): Émettre au client les messages de connexions.
		//

		// Welcome
		let client_user = client.user();
		let user_host = client_user.host.to_string();
		let welcome_001 = RplWelcomeReply {
			origin: Some(client_user),
			nickname: &client_user.nickname,
			ident: &client_user.ident,
			host: &user_host,
			tags: RplWelcomeReply::default_tags(),
		}
		.with_tags([("client_id", client.id())]);

		// Version
		let program_version = format!("v{}", env!("CARGO_PKG_VERSION"));
		let yourhost_002 = RplYourhostReply {
			origin: Some(client_user),
			servername: &config.server.name,
			version: &program_version,
			tags: RplYourhostReply::default_tags(),
		};

		// Server creation info
		let server_created_at = if let Some(server_created_at) = config.server.created_at {
			time::Utc.timestamp_opt(server_created_at, 0).unwrap()
		} else {
			time::Utc::now()
		};
		let created_003 = RplCreatedReply {
			origin: Some(client_user),
			date: &server_created_at,
			tags: RplCreatedReply::default_tags(),
		};

		// Envoie des messages de connexions.
		_ = socket.emit(welcome_001.name(), welcome_001);
		_ = socket.emit(yourhost_002.name(), yourhost_002);
		_ = socket.emit(created_003.name(), created_003);

		// Transmet les utilisateurs bloqués/ignorés du client (au client
		// lui-même ;-))
		let users: Vec<_> = app
			.clients
			.blocklist(client.id())
			.into_iter()
			.map(|client| client.user().to_owned())
			.collect();
		if !users.is_empty() {
			let users: Vec<_> = users.iter().collect();
			let rpl_ignore = RplIgnoreReply {
				origin: Some(client_user),
				tags: RplIgnoreReply::default_tags(),
				users: users.as_slice(),
				updated: &false,
			};
			_ = socket.emit(rpl_ignore.name(), rpl_ignore);
		}

		Some(())
	}
}
