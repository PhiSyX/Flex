// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientSocketInterface, Socket};

use flex_chat_macro::command_response;

command_response! {
	struct PRIVMSG
	{
		/// La cible du message.
		target: &'a str,
		/// Le texte.
		text: &'a str,
	}
}

// --------- //
// Interface //
// --------- //

pub trait PrivmsgClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /PRIVMSG <nickname>
	fn emit_privmsg<User>(&self, target: &str, text: &str, by: User)
	where
		User: serde::Serialize,
	{
		let privmsg_command = PrivmsgCommandResponse {
			origin: &by,
			target,
			text,
			tags: PrivmsgCommandResponse::default_tags(),
		};

		_ = self.socket().emit(privmsg_command.name(), &privmsg_command);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PrivmsgClientSocketCommandResponseInterface for Socket<'s> {}
