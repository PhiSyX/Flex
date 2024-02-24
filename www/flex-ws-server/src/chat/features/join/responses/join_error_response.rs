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

use crate::src::chat::features::join::ErrBadchannelkeyError;

// --------- //
// Interface //
// --------- //

pub trait JoinErrorResponseInterface: ClientSocketInterface
{
	/// Émet au client l'erreur [crate::ERR_BADCHANNELKEY].
	fn send_err_badchannelkey(&self, channel_name: &str);

	// TODO: ERR_CHANNELISFULL
	#[allow(dead_code)]
	fn send_err_channelisfull(&self) {}

	// TODO: ERR_TOOMANYCHANNELS
	#[allow(dead_code)]
	fn send_err_toomanychannels(&self) {}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> JoinErrorResponseInterface for Socket<'s>
{
	fn send_err_badchannelkey(&self, channel_name: &str)
	{
		let origin = Origin::from(self.client());
		let err_badchannelkey = ErrBadchannelkeyError {
			channel: channel_name,
			tags: ErrBadchannelkeyError::default_tags(),
			origin: &origin,
		};
		self.emit(err_badchannelkey.name(), err_badchannelkey);
	}
}
