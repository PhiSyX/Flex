// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::QuitCommandResponse;
use crate::src::chat::components::{client, ClientSocketInterface, Origin};

// --------- //
// Interface //
// --------- //

pub trait QuitClientSocketInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /QUIT.
	fn emit_quit(&self, room: &str, reason: impl ToString)
	{
		let msg = reason.to_string();

		let origin = Origin::from(self.client());
		let quit_command = QuitCommandResponse {
			origin: &origin,
			tags: QuitCommandResponse::default_tags(),
			message: msg.as_str(),
		};

		self.emit_to(
			format!("channel:{}", room.to_lowercase()),
			quit_command.name(),
			quit_command,
		);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> QuitClientSocketInterface for client::Socket<'s> {}
