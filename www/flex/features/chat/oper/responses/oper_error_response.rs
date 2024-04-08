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

use crate::features::chat::oper::{
	ErrNooperhostError,
	ErrNoprivilegesError,
	ErrOperonlyError,
	ErrPasswdmismatchError,
};

// --------- //
// Interface //
// --------- //

pub trait OperClientSocketErrorRepliesInterface
	: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrPasswdmismatchError].
	fn send_err_passwdmismatch(&self)
	{
		let origin = Origin::from(self.client());
		let err_passwdmismatch = ErrPasswdmismatchError {
			origin: &origin,
			tags: ErrPasswdmismatchError::default_tags(),
		};
		self.emit(err_passwdmismatch.name(), err_passwdmismatch);
	}

	/// Émet au client l'erreur [ErrNooperhostError].
	fn send_err_nooperhost(&self)
	{
		let origin = Origin::from(self.client());
		let err_nooperhost = ErrNooperhostError {
			origin: &origin,
			tags: ErrNooperhostError::default_tags(),
		};
		self.emit(err_nooperhost.name(), err_nooperhost);
	}

	/// Émet au client l'erreur [ErrOperonlyError].
	fn send_err_operonly(&self, channel: &str)
	{
		let origin = Origin::from(self.client());
		let err_operonly = ErrOperonlyError {
			origin: &origin,
			channel,
			tags: ErrOperonlyError::default_tags(),
		};
		self.emit(err_operonly.name(), err_operonly);
	}

	/// Émet au client l'erreur [ErrNoprivilegesError].
	fn send_err_noprivileges(&self)
	{
		let origin = Origin::from(self.client());
		let err_noprivileges = ErrNoprivilegesError {
			origin: &origin,
			tags: ErrNoprivilegesError::default_tags(),
		};
		self.emit(err_noprivileges.name(), err_noprivileges);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> OperClientSocketErrorRepliesInterface for Socket<'s> {}
