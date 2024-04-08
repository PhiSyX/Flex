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
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::join::{
	JoinApplicationInterface,
	SajoinCommandFormData,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct SajoinHandler;

// -------------- //
// Implémentation //
// -------------- //

impl SajoinHandler
{
	pub const COMMAND_NAME: &'static str = "SAJOIN";

	/// La commande SAJOIN est utilisée par un client de type opérateur global
	/// pour forcer les pseudo à rejoindre des salons spécifiques.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<SajoinCommandFormData>,
	)
	{
		let Some(client_socket) = app.current_client_operator(&socket) else {
			return;
		};

		for nickname in data.nicknames.iter() {
			#[rustfmt::skip]
			let Some(nickname_socket) = app.find_socket_by_nickname(
				&socket,
				nickname,
			) else {
				client_socket.send_err_nosuchnick(nickname);
				continue;
			};

			for channel_name in data.channels.iter() {
				_ = app.join_or_create_channel_bypass_permission(
					&nickname_socket,
					channel_name.as_ref(),
				);
			}
		}
	}
}
