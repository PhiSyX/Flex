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

use crate::features::chat::nick::{
	ErrErroneusnicknameError,
	ErrNicknameinuseError,
};

// --------- //
// Interface //
// --------- //

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

impl<'s> NickClientSocketErrorRepliesInterface for Socket<'s> {}
