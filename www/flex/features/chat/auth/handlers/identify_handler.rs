// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::ClientSocketInterface;
use flex_chat_user::UserInterface;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::auth::{
	AuthChatApplicationInterface,
	IdentifyCommandResponseInterface,
};
use crate::features::users::dto::UserSessionDTO;
use crate::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct AuthIdentifyHandler;

// -------------- //
// Implémentation //
// -------------- //

impl AuthIdentifyHandler
{
	pub const COMMAND_NAME: &'static str = "AUTH IDENTIFY";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(user_session): Data<UserSessionDTO>,
	)
	{
		let mut client_socket = app.current_client_mut(&socket);

		let old_client_id = *client_socket.cid();
		let old_nickname = client_socket.user().nickname().to_owned();

		app.change_id_of_client(&mut client_socket, user_session.id);
		app.change_nickname_of_client(&mut client_socket, &user_session.name);

		let new_client_id = *client_socket.cid();
		let new_nickname = client_socket.user().nickname().to_owned();

		for channel_room in client_socket.channels_rooms() {
			let channel_id = &channel_room["channel:".len()..];

			client_socket.emit_upgrade_user(
				channel_id,
				old_client_id,
				new_client_id,
				&old_nickname,
				&new_nickname,
			);
		}
	}
}
