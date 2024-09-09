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
use flex_web_framework::WebSocketHandler;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::part::{
	PartChannelApplicationInterface,
	SapartCommandFormData,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct SapartHandler;

// -------------- //
// Implémentation //
// -------------- //

impl WebSocketHandler for SapartHandler
{
	type App = ChatApplication;
	type Data = SapartCommandFormData;

	const EVENT_NAME: &'static str = "SAPART";

	/// La commande SAPART entraîne la suppression des utilisateurs de force.
	fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<SapartCommandFormData>,
	)
	{
		let Some(client_socket) = app.current_client_operator(&socket) else {
			return;
		};

		for nickname in data.nicknames.iter() {
			let Some(nickname_socket) =
				app.find_socket_by_nickname(&socket, nickname)
			else {
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
