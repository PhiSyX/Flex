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

use crate::src::chat::features::nick::{
	NickApplicationInterface,
	NickClientSocketErrorRepliesInterface,
	NickCommandFormData,
};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

pub struct NickHandler;

// -------------- //
// Implémentation //
// -------------- //

/// La commande `NICK` est utilisée pour donner un pseudonyme au client ou
/// changer le pseudonyme existant d'un client.
impl NickHandler
{
	pub const COMMAND_NAME: &'static str = "NICK";

	pub fn handle(
		socket: SocketRef,
		State(app): State<ChatApplication>,
		Data(data): Data<NickCommandFormData>,
	)
	{
		let mut client_socket = app.current_client_mut(&socket);

		// NOTE: Le pseudonyme existe déjà?
		if app.can_locate_client_by_nickname(&data.nickname) {
			client_socket.send_err_nicknameinuse(&data.nickname);
			return;
		}

		app.change_nickname_of_client(&mut client_socket, &data.nickname);
	}
}
