// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use client::Origin;

use super::KillCommandResponse;
use crate::src::chat::components::client::{self, ClientSocketInterface};

// --------- //
// Interface //
// --------- //

pub trait KillClientSocketCommandResponseInterface
{
	/// Émet au client les réponses liées à la commande /KILL.
	fn emit_kill(&self, knick_client_socket: &Self, reason: &str);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> KillClientSocketCommandResponseInterface for client::Socket<'s>
{
	fn emit_kill(&self, knick_client_socket: &Self, reason: &str)
	{
		let origin = Origin::from(self.client());

		let knick_origin = Origin::from(knick_client_socket.client());

		let cmd_kill = KillCommandResponse {
			origin: &origin,
			knick: &knick_origin,
			reason,
			tags: KillCommandResponse::default_tags(),
		};

		self.emit_within(
			knick_client_socket.channels_rooms(),
			cmd_kill.name(),
			cmd_kill,
		);
	}
}
