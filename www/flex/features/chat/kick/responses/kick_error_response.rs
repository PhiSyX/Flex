// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{Channel, ChannelInterface};
use flex_chat_client::{ClientSocketInterface, Origin, Socket};

use crate::features::chat::kick::ErrCannotkickglobopsError;

// --------- //
// Interface //
// --------- //

pub trait KickChannelClientSocketErrorRepliesInterface
	: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client l'erreur [ErrCannotkickglobopsError].
	fn send_err_cannotkickglobops(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		nickname: &str,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> KickChannelClientSocketErrorRepliesInterface for Socket<'s>
{
	type Channel = Channel;

	fn send_err_cannotkickglobops(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
		nickname: &str,
	)
	{
		let origin = Origin::from(self.client());
		let err_cannotsendtochan = ErrCannotkickglobopsError {
			channel: channel_name,
			nick: nickname,
			origin: &origin,
			tags: ErrCannotkickglobopsError::default_tags(),
		};
		self.emit(err_cannotsendtochan.name(), err_cannotsendtochan);
	}
}
