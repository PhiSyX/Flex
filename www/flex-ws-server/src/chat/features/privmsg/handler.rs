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

pub struct PrivmsgHandler;

// -------------- //
// Implémentation //
// -------------- //

impl PrivmsgHandler
{
	pub const COMMAND_NAME: &'static str = "PRIVMSG";

	/// PRIVMSG est utilisé pour envoyer des messages privés entre utilisateurs,
	/// ainsi que pour envoyer des messages à des salons.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<super::PrivmsgCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		for target in data.targets.iter() {
			if target.starts_with('#') {
				match app.is_client_able_to_write_on_channel(&client_socket, target) {
					| ChannelPermissionWrite::Yes(channel_nick) => {
						let channel_member =
							ChannelNickClient::from((client_socket.client(), channel_nick));
						client_socket.emit_privmsg_to_channel(target, &data.text, channel_member);
					}
					| ChannelPermissionWrite::Bypass => {
						client_socket.emit_privmsg_to_channel(
							target,
							&data.text,
							client_socket.user(),
						);
					}
					| ChannelPermissionWrite::No => {
						client_socket.send_err_cannotsendtochan(target);
					}
				}

				continue;
			}

			client_socket.emit_privmsg_to_nickname(target, &data.text, client_socket.user());

			if client_socket.check_nickname(target) {
				continue;
			}

			let Some(target_client_socket) = app.find_socket_by_nickname(&socket, target) else {
				client_socket.send_err_nosuchnick(target);
				continue;
			};

			if app.client_isin_blocklist(&target_client_socket, &client_socket) {
				continue;
			}

			target_client_socket.emit_privmsg_to_nickname(target, &data.text, client_socket.user());
		}
	}
}
