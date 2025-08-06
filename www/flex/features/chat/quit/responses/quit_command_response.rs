// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::client::{ClientSocketInterface, Origin, Socket};
use flex_chat::macros::command_response;

command_response! {
	/// Une session client se termine par un message de déconnexion. Le serveur
	/// en prend acte en envoyant un message ERROR au client.
	struct QUIT<'message>
	{
		/// Message de déconnexion.
		message: &'message str,
	}
}

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

impl<'s> QuitClientSocketInterface for Socket<'s> {}
