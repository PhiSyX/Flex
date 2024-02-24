// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{self, ClientSocketInterface, Socket};
use flex_chat_macro::command_response;

command_response! {
	struct PUBMSG
	{
		/// Le salon.
		channel: &'a str,
		/// Le texte.
		text: &'a str,
		/// Message venant de l'extérieur?
		external: bool,
	}
}

// --------- //
// Interface //
// --------- //

pub trait PubmsgClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /PUBMSG <channel>
	fn emit_pubmsg<User>(&self, channel_name: &str, text: &str, by: User, external: bool)
	where
		User: serde::Serialize,
	{
		let pubmsg_command = PubmsgCommandResponse {
			origin: &by,
			tags: PubmsgCommandResponse::default_tags(),
			channel: channel_name,
			text,
			external,
		};

		_ = self.socket().emit(pubmsg_command.name(), &pubmsg_command);

		let target_room = format!("channel:{}", channel_name.to_lowercase());

		_ = self
			.socket()
			.except(self.useless_people_room())
			.to(target_room)
			.emit(pubmsg_command.name(), pubmsg_command);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PubmsgClientSocketCommandResponseInterface for Socket<'s> {}
