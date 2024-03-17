// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::ChannelsSessionInterface;
use flex_chat_client::ClientSocketInterface;
use flex_chat_user::UserOperatorInterface;
use socketioxide::extract::{Data, SocketRef, State};

use crate::features::chat::list::{
	ListApplicationInterface,
	ListChannelClientSocketCommandResponseInterface,
	ListCommandFormData,
};
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct ListHandler;

// -------------- //
// Implémentation //
// -------------- //

impl ListHandler
{
	pub const COMMAND_NAME: &'static str = "LIST";

	/// La commande list permet de dresser la liste des salons et de leurs
	/// sujets.
	//
	// TODO: Les caractères joker sont autorisés dans le paramètre <channels>.
	// TODO: Mettre en cache le résultat, pendant une certaine durée.
	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(_): Data<ListCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		client_socket.send_rpl_liststart();

		for channel in app.channels.list() {
			if client_socket.user().is_global_operator() {
				client_socket.send_rpl_list(channel.value());
				continue;
			}

			if app.is_client_has_channel(client_socket.cid(), &channel.name) {
				client_socket.send_rpl_list(channel.value());
				continue;
			}

			if !channel.modes_settings.has_secret_flag() {
				client_socket.send_rpl_list(channel.value());
				continue;
			}
		}

		client_socket.send_rpl_listend();
	}
}
