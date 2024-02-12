// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::NickCommandResponse;
use crate::src::chat::components::{client, ClientSocketInterface, Origin};
use crate::src::chat::replies::{ErrErroneusnicknameError, ErrNicknameinuseError};

// --------- //
// Interface //
// --------- //

pub trait NickClientSocketCommandResponseInterface: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /NICK.
	fn emit_nick(&self)
	{
		let (old_nickname, new_nickname): (&str, &str) = (
			self.user().old_nickname.as_deref().unwrap(),
			self.user().nickname.as_ref(),
		);

		let origin = Origin::from(self.client());

		let cmd_nick = NickCommandResponse {
			origin: &origin,
			tags: NickCommandResponse::default_tags(),
			old_nickname,
			new_nickname,
		}
		.with_tags([("userid", self.client().cid())]);

		_ = self
			.socket()
			.join(format!("private:{}", new_nickname.to_lowercase()));

		// NOTE: notifier toutes les rooms dont fait partie le client que le
		// pseudonyme du client a été changé.

		self.emit(cmd_nick.name(), &cmd_nick);
		// FIXME(phisyx): À améliorer pour n'envoyer qu'une seul événement à
		// tous les client en communs.
		self.broadcast(cmd_nick.name(), &cmd_nick);

		_ = self
			.socket()
			.leave(format!("private:{}", old_nickname.to_lowercase()));
	}
}

pub trait NickClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrNicknameinuseError].
	fn send_err_nicknameinuse(&self, nickname: impl AsRef<str>)
	{
		let origin = Origin::from(self.client());
		let err_nicknameinuse = ErrNicknameinuseError {
			origin: &origin,
			nickname: nickname.as_ref(),
			tags: ErrNicknameinuseError::default_tags(),
		};
		self.emit(err_nicknameinuse.name(), err_nicknameinuse);
	}

	/// Émet au client l'erreur [ErrErroneusnicknameError].
	fn send_err_erroneusnickname(&self, nickname: &str)
	{
		let origin = Origin::from(self.client());
		let err_erroneusnickname = ErrErroneusnicknameError {
			origin: &origin,
			nickname,
			tags: ErrErroneusnicknameError::default_tags(),
		};
		self.emit(err_erroneusnickname.name(), err_erroneusnickname);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> NickClientSocketCommandResponseInterface for client::Socket<'s> {}
impl<'s> NickClientSocketErrorRepliesInterface for client::Socket<'s> {}
