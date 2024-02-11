// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{UserStatusAwayClientsSessionInterface, UserStatusClientSocketInterface};
use crate::src::chat::components::client;
use crate::src::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait UserStatusAwayApplicationInterface
{
	/// Marque le client en session comme étant absent.
	fn marks_client_as_away(&self, client_socket: &client::Socket, text: impl ToString);

	/// Marque le client en session comme n'étant plus absent.
	fn marks_client_as_no_longer_away(&self, client_socket: &client::Socket);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl UserStatusAwayApplicationInterface for ChatApplication
{
	fn marks_client_as_away(&self, client_socket: &client::Socket, text: impl ToString)
	{
		self.clients.marks_client_as_away(client_socket.cid(), text);
		client_socket.send_rpl_nowaway();
	}

	fn marks_client_as_no_longer_away(&self, client_socket: &client::Socket)
	{
		if self.clients.is_client_away(client_socket.cid()) {
			self.clients
				.marks_client_as_no_longer_away(client_socket.cid());
			client_socket.send_rpl_unaway();
		} else {
			self.clients
				.marks_client_as_away(client_socket.cid(), "Je suis absent.");
			client_socket.send_rpl_nowaway();
		}
	}
}
