// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientSocketInterface, Origin};
use flex_chat_client_nick::NickClientSocketErrorReplies;
use flex_chat_user::UserAwayInterface;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::message::{
	PrivmsgClientSocketCommandResponseInterface,
	PrivmsgCommandFormData,
};
use crate::features::chat::silence::SilenceApplicationInterface;
use crate::features::chat::user_status::UserStatusClientSocketInterface;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct PrivmsgHandler;

// -------------- //
// Implémentation //
// -------------- //

impl PrivmsgHandler
{
	pub const COMMAND_NAME: &'static str = "PRIVMSG";

	/// PRIVMSG est utilisé pour envoyer des messages privés entre utilisateurs.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<PrivmsgCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for target in data.targets.iter() {
			let origin = Origin::from(client_socket.client());
			client_socket.emit_privmsg(target, &data.text, &origin);

			if client_socket.check_nickname(target) {
				continue;
			}

			let Some(target_client_socket) = app.find_socket_by_nickname(
				&socket,
				target,
			) else {
				client_socket.send_err_nosuchnick(target);
				continue;
			};

			if app.client_isin_blocklist(&target_client_socket, &client_socket) {
				continue;
			}

			target_client_socket.emit_privmsg(target, &data.text, &origin);
			if target_client_socket.client().user().is_away() {
				client_socket.send_rpl_away(&target_client_socket);
			}
		}
	}
}
