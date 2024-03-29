// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientInterface, ClientSocketInterface, Origin, Socket};
use flex_chat_macro::command_response;
use flex_chat_user::UserInterface;

command_response! {
	struct NICK<'old, 'new>
	{
		/// Ancien pseudonyme.
		old_nickname: &'old str,
		/// Nouveau pseudonyme.
		new_nickname: &'new str,
	}
}

// --------- //
// Interface //
// --------- //

pub trait NickClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /NICK.
	fn emit_nick(&self)
	{
		let (old_nickname, new_nickname): (&str, &str) = (self.user().old_nickname(), self.user().nickname());

		let origin = Origin::from(self.client());

		let nick_command = NickCommandResponse {
			origin: &origin,
			tags: NickCommandResponse::default_tags(),
			old_nickname,
			new_nickname,
		}
		.with_tags([("userid", self.client().cid())]);

		_ = self.socket().join(format!("private:{}", new_nickname.to_lowercase()));

		// NOTE: notifier toutes les rooms dont fait partie le client que le
		// pseudonyme du client a été changé.

		self.emit(nick_command.name(), &nick_command);
		// FIXME(phisyx): À améliorer pour n'envoyer qu'une seul événement à
		// tous les client en communs.
		self.broadcast(nick_command.name(), &nick_command);

		_ = self.socket().leave(format!("private:{}", old_nickname.to_lowercase()));
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> NickClientSocketCommandResponseInterface for Socket<'s> {}
