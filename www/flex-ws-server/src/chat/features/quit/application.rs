// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientSocketInterface, Socket};

use super::QuitClientSocketInterface;
use crate::src::chat::features::PartChannelsSessionInterface;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait QuitApplicationInterface
{
	/// Déconnecte un client de session.
	fn disconnect_client(&self, client_socket: Socket, reason: impl ToString);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl QuitApplicationInterface for ChatApplication
{
	fn disconnect_client(&self, client_socket: Socket, reason: impl ToString)
	{
		let Some(mut session_client) = self.get_client_mut_by_id(client_socket.cid()) else {
			return;
		};
		for channel_name in session_client.channels.iter() {
			client_socket.emit_quit(channel_name, reason.to_string());
		}
		self.channels
			.remove_client_from_all_his_channels(&session_client);
		session_client.channels.clear();
		session_client.disconnect();
	}
}
