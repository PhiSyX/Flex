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

use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::permission::ChannelPermissionWrite;
use crate::src::chat::replies::*;
use crate::src::chat::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct PubmsgHandler;

// -------------- //
// Implémentation //
// -------------- //

impl PubmsgHandler
{
	pub const COMMAND_NAME: &'static str = "PUBMSG";

	/// PUBMSG est utilisé pour envoyer des messages à des salons.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::PubmsgCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel in data.channels.iter() {
			match app.is_client_able_to_write_on_channel(&client_socket, channel) {
				| ChannelPermissionWrite::Yes(channel_nick) => {
					let channel_member =
						ChannelNickClient::from((client_socket.client(), channel_nick));
					client_socket.emit_pubmsg(channel, &data.text, channel_member);
				}
				| ChannelPermissionWrite::Bypass => {
					client_socket.emit_pubmsg(channel, &data.text, client_socket.user());
				}
				| ChannelPermissionWrite::No => {
					client_socket.send_err_cannotsendtochan(channel);
				}
			}
		}
	}
}
