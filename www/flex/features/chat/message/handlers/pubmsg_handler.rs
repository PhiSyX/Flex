// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{ChannelNoPermissionCause, ChannelWritePermission};
use flex_chat::client::ClientSocketInterface;
use flex_web_framework::WebSocketHandler;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::ChatApplication;
use crate::features::chat::message::{
	MessageApplicationInterface,
	PubmsgClientSocketCommandResponseInterface,
	PubmsgClientSocketErrorRepliesInterface,
	PubmsgCommandFormData,
};
use crate::features::chat::mode::ChannelMemberDTO;

// --------- //
// Structure //
// --------- //

pub struct PubmsgHandler;

// -------------- //
// Implémentation //
// -------------- //

impl WebSocketHandler for PubmsgHandler
{
	type App = ChatApplication;
	type Data = PubmsgCommandFormData;

	const EVENT_NAME: &'static str = "PUBMSG";

	/// PUBMSG est utilisé pour envoyer des messages à des salons.
	fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<PubmsgCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel in data.channels.iter() {
			let channel_permission =
				app.is_client_able_to_write_on_channel(&client_socket, channel);

			match channel_permission {
				| ChannelWritePermission::Yes(member) => {
					let channel_member = ChannelMemberDTO::from((
						client_socket.client(),
						member,
					));
					client_socket.emit_pubmsg(
						channel,
						data.formats.as_ref().zip(data.colors.as_ref()),
						&data.text,
						&channel_member,
					);
				}
				| ChannelWritePermission::Bypass => {
					client_socket.emit_external_pubmsg(
						channel,
						data.formats.as_ref().zip(data.colors.as_ref()),
						&data.text,
						client_socket.user(),
					);
				}
				| ChannelWritePermission::No(cause) => {
					let why = match cause {
						| ChannelNoPermissionCause::ERR_NOSUCHCHANNEL => "",
						| ChannelNoPermissionCause::ERR_BANNEDFROMCHAN => {
							"(+b)"
						}
						| ChannelNoPermissionCause::ERR_CHANISINMODERATED => {
							"(+m)"
						}
						| ChannelNoPermissionCause::ERR_NOTMEMBEROFCHAN => {
							"(+n)"
						}
					};
					client_socket.send_err_cannotsendtochan(channel, why);
				}
			}
		}
	}
}
