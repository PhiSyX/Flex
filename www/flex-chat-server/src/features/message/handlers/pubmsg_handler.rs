// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{ChannelNoPermissionCause, ChannelWritePermission};
use flex_chat_client::ClientSocketInterface;
use flex_chat_macro::command_response;
use socketioxide::extract::{Data, SocketRef, State};

use crate::src::features::message::{
	MessageApplicationInterface,
	PubmsgClientSocketCommandResponseInterface,
	PubmsgClientSocketErrorRepliesInterface,
	PubmsgCommandFormData,
};
use crate::src::features::ChannelMemberDTO;
use crate::src::ChatApplication;

command_response! {
	struct PUBMSG
	{
		/// Le salon.
		channel: &'a str,
		/// Le texte.
		text: &'a str,
		/// Message venant de l'extérieur?
		external: bool,
	}
}

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
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<PubmsgCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for channel in data.channels.iter() {
			match app.is_client_able_to_write_on_channel(&client_socket, channel) {
				| ChannelWritePermission::Yes(channel_nick) => {
					let channel_member =
						ChannelMemberDTO::from((client_socket.client(), channel_nick));
					client_socket.emit_pubmsg(channel, &data.text, channel_member, false);
				}
				| ChannelWritePermission::Bypass => {
					client_socket.emit_pubmsg(channel, &data.text, client_socket.user(), true);
				}
				| ChannelWritePermission::No(cause) => {
					let why = match cause {
						| ChannelNoPermissionCause::ERR_NOSUCHCHANNEL => "",
						| ChannelNoPermissionCause::ERR_BANNEDFROMCHAN => "(+b)",
						| ChannelNoPermissionCause::ERR_CHANISINMODERATED => "(+m)",
						| ChannelNoPermissionCause::ERR_NOTMEMBEROFCHAN => "(+n)",
					};
					client_socket.send_err_cannotsendtochan(channel, why);
				}
			}
		}
	}
}
