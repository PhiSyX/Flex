// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::client::nick::errors::ErrNosuchnickError;
use crate::client::{ClientSocketInterface, Origin, Socket};

// --------- //
// Interface //
// --------- //

pub trait NickClientSocketErrorReplies: ClientSocketInterface
{
	/// Émet au client l'erreur [crate::ErrNosuchnickError].
	fn send_err_nosuchnick(&self, nickname: &str);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> NickClientSocketErrorReplies for Socket<'a>
{
	fn send_err_nosuchnick(&self, nickname: &str)
	{
		let origin = Origin::from(self.client());
		let err_nosuchnick = ErrNosuchnickError {
			origin: &origin,
			nickname,
			tags: ErrNosuchnickError::default_tags(),
		};
		self.emit(err_nosuchnick.name(), err_nosuchnick);
	}
}
