// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client_nick::NickClientSocketErrorReplies;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::part::SapartCommandFormData;
use crate::features::chat::PartChannelApplicationInterface;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct SapartHandler;

// -------------- //
// Implémentation //
// -------------- //

impl SapartHandler
{
	pub const COMMAND_NAME: &'static str = "SAPART";

	/// La commande SAPART entraîne la suppression des utilisateurs de force.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<SapartCommandFormData>,
	)
	{
		let Some(client_socket) = app.current_client_operator(&socket) else {
			return;
		};

		for nickname in data.nicknames.iter() {
			let Some(nickname_socket) = app.find_socket_by_nickname(&socket, nickname) else {
				client_socket.send_err_nosuchnick(nickname);
				continue;
			};

			for channel_name in data.channels.iter() {
				app.force_part_channel::<&str>(
					&client_socket,
					&nickname_socket,
					channel_name,
					data.message.as_deref(),
				);
			}
		}
	}
}
