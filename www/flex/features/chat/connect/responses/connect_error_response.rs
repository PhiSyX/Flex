// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_client::{ClientSocketInterface, Origin, Socket};

use crate::features::chat::connect::errors::ErrAlreadyregisteredError;

// --------- //
// Interface //
// --------- //

pub trait ConnectClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrAlreadyregisteredError].
	fn send_err_alreadyregistered(&self)
	{
		let origin = Origin::from(self.client());
		let err_alreadyregistered = ErrAlreadyregisteredError {
			origin: &origin,
			tags: ErrAlreadyregisteredError::default_tags(),
		};

		self.emit(err_alreadyregistered.name(), err_alreadyregistered);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ConnectClientSocketErrorRepliesInterface for Socket<'s> {}
