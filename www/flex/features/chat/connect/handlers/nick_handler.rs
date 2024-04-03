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

use super::ConnectionRegistrationHandler;
use crate::features::chat::nick::*;
use crate::features::ChatApplication;
use crate::FlexApplicationState;

// --------- //
// Structure //
// --------- //

pub struct UNickHandler;

// -------------- //
// Implémentation //
// -------------- //

impl UNickHandler
{
	pub const COMMAND_NAME: &'static str = "NICK (unregistered)";

	pub fn handle(
		socket: SocketRef,
		State(server_state): State<FlexApplicationState>,
		State(app): State<ChatApplication>,
		Data(data): Data<NickCommandFormData>,
	)
	{
		if app.can_locate_client_by_nickname(&data.nickname) {
			let client_socket = app.current_client(&socket);
			client_socket.send_err_nicknameinuse(&data.nickname);
			return;
		}

		let check = {
			let mut client_socket = app.current_client_mut(&socket);
			client_socket.user_mut().set_nickname(&data.nickname).ok();
			ConnectionRegistrationHandler::complete_registration(server_state, app, client_socket)
		};

		if check.is_none() {
			_ = socket.disconnect();
		}
	}
}
