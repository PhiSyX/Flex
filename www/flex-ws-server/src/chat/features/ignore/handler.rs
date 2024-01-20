// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use socketioxide::extract::{Data, SocketRef, State};

use crate::src::chat::components::ClientSocketInterface;
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct IgnoreHandler;

pub struct UnignoreHandler;

// -------------- //
// Implémentation //
// -------------- //

impl IgnoreHandler
{
	pub const COMMAND_NAME: &'static str = "IGNORE";

	/// La commande `/IGNORE` permet de ne plus être notifié des messages d'un
	/// client que ces soit dans les messages privés ou publiques.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::IgnoreCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		if client_socket.check_nickname(&data.nickname) {
			return;
		}

		let Some(to_ignore_client_socket) = app.find_socket_by_nickname(&socket, &data.nickname)
		else {
			client_socket.send_err_nosuchnick(&data.nickname);
			return;
		};

		app.add_client_to_blocklist(&client_socket, &to_ignore_client_socket);

		_ = client_socket
			.socket()
			.join(to_ignore_client_socket.useless_people_room());

		let users = [to_ignore_client_socket.user()];
		client_socket.send_rpl_ignore(&users, true);
	}
}

impl UnignoreHandler
{
	pub const COMMAND_NAME: &'static str = "UNIGNORE";

	/// La commande `/UNIGNORE` permet retirer un membre bloqué de la liste
	/// des membres bloqués du client courant.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::IgnoreCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		if client_socket.check_nickname(&data.nickname) {
			return;
		}

		let Some(to_unignore_client_socket) = app.find_socket_by_nickname(&socket, &data.nickname)
		else {
			client_socket.send_err_nosuchnick(&data.nickname);
			return;
		};

		app.remove_client_to_blocklist(&client_socket, &to_unignore_client_socket);

		_ = client_socket
			.socket()
			.leave(to_unignore_client_socket.useless_people_room());

		let users = [to_unignore_client_socket.user()];
		client_socket.send_rpl_unignore(&users)
	}
}
