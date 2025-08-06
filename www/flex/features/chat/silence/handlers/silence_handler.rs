// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::nick::responses::NickClientSocketErrorReplies;
use flex_chat::client::{ClientSocketInterface, Origin};
use flex_web_framework::WebSocketHandler;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::ChatApplication;
use crate::features::chat::silence::{
	SilenceApplicationInterface,
	SilenceClientSocketInterface,
	SilenceCommandFormData,
};

// --------- //
// Structure //
// --------- //

pub struct SilenceHandler;

// -------------- //
// Implémentation //
// -------------- //

impl WebSocketHandler for SilenceHandler
{
	type App = ChatApplication;
	type Data = SilenceCommandFormData;

	const EVENT_NAME: &'static str = "SILENCE";

	/// La commande `/SILENCE` permet de ne plus être notifié des messages d'un
	/// client que ces soit dans les messages privés ou publiques.
	fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<SilenceCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		let nickname = &data.nickname[1..];

		if client_socket.has_same_nickname(nickname) {
			return;
		}

		let Some(to_silence_client_socket) =
			app.find_socket_by_nickname(&socket, nickname)
		else {
			client_socket.send_err_nosuchnick(nickname);
			return;
		};

		// NOTE(phisyx): utilisateur à ajouter dans la liste des utilisateurs
		// 				 ignorés.

		if data.nickname.starts_with('+') {
			_ = client_socket
				.socket()
				.join(to_silence_client_socket.useless_people_room());

			if app.add_client_to_blocklist(
				&client_socket,
				&to_silence_client_socket,
			) {
				let users = [&Origin::from(to_silence_client_socket.client())];
				client_socket.emit_silence(&users, Some(true));
			}

			return;
		}

		// NOTE(phisyx): utilisateur à retirer de la liste des utilisateurs
		// 				 ignorés.

		_ = client_socket
			.socket()
			.leave(to_silence_client_socket.useless_people_room());

		if app.remove_client_to_blocklist(
			&client_socket,
			&to_silence_client_socket,
		) {
			let users = [&Origin::from(to_silence_client_socket.client())];
			client_socket.emit_silence(&users, Some(false));
		}
	}
}
