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

use crate::features::chat::message::ErrCannotsendtochanError;

// --------- //
// Interface //
// --------- //

pub trait PubmsgClientSocketErrorRepliesInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [ErrCannotsendtochanError].
	fn send_err_cannotsendtochan(&self, channel_name: &str, why: &str)
	{
		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotsendtochanError {
			channel_name,
			why,
			origin: &origin,
			tags: ErrCannotsendtochanError::default_tags(),
		};
		self.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}
}
// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> PubmsgClientSocketErrorRepliesInterface for Socket<'s> {}
