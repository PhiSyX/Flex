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

use super::{ErrNooperhostError, ErrOperonlyError, ErrPasswdmismatchError, RplYoureoperReply};
use crate::src::chat::components;
use crate::src::chat::components::client::{self, ClientSocketInterface};

// --------- //
// Interface //
// --------- //

pub trait OperClientSocketCommandResponse: ClientSocketInterface
{
	/// Émet au client les réponses liées à la commande /OPER.
	fn send_rpl_youreoper(&self, oper_type: components::user::Flag)
	{
		let origin = Origin::from(self.client());
		let rpl_youreoper = RplYoureoperReply {
			origin: &origin,
			tags: RplYoureoperReply::default_tags(),
			oper_type: &oper_type,
		};
		self.emit(rpl_youreoper.name(), rpl_youreoper);
	}
}

pub trait OperClientSocketErrorRepliesInterface: ClientSocketInterface
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
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> OperClientSocketCommandResponse for client::Socket<'s> {}
impl<'s> OperClientSocketErrorRepliesInterface for client::Socket<'s> {}
