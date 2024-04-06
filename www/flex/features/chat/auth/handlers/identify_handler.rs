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

use crate::features::chat::auth::AuthChatApplicationInterface;
use crate::features::chat::connect::ConnectClientSocketCommandResponseInterface;
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

		app.change_id_of_client(&mut client_socket, user_session.id);
		app.change_nickname_of_client(&mut client_socket, &user_session.name);

		client_socket.send_rpl_welcome();
	}
}
