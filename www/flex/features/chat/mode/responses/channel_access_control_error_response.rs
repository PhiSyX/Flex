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

use crate::features::chat::mode::ErrBannedfromchanError;

// --------- //
// Interface //
// --------- //

pub trait ModeAccessControlClientSocketErrorRepliesInterface: ClientSocketInterface
{
	type Channel: ChannelInterface;

	fn send_err_bannedfromchan(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> ModeAccessControlClientSocketErrorRepliesInterface for Socket<'s>
{
	type Channel = Channel;

	fn send_err_bannedfromchan(&self, channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>)
	{
		let origin = Origin::from(self.client());

		let err_bannedfromchan = ErrBannedfromchanError {
			origin: &origin,
			tags: ErrBannedfromchanError::default_tags(),
			channel: channel_name,
		};

		self.emit(err_bannedfromchan.name(), err_bannedfromchan);
	}
}
