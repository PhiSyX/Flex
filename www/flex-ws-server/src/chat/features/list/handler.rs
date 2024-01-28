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

use crate::src::ChatApplication;

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
	///
	// TODO: Les caractères joker sont autorisés dans le paramètre <channels>.
	// TODO: Mettre en cache le résultat, pendant une certaine durée.
	pub async fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(_): Data<super::ListCommandFormData>,
	)
	{
		let client_socket = app.current_client(&socket);

		client_socket.send_rpl_liststart();

		for channel in app.channels.list() {
			client_socket.send_rpl_list(channel.value());
		}

		client_socket.send_rpl_listend();
	}
}
