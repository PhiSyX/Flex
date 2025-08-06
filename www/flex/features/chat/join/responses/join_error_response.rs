// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{Channel, ChannelInterface};
use flex_chat::client::{ClientSocketInterface, Origin, Socket};

use crate::features::chat::join::{
	ErrBadchannelkeyError,
	ErrChannelisfullError,
};

// --------- //
// Interface //
// --------- //

pub trait JoinErrorResponseInterface: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client l'erreur [crate::ERR_BADCHANNELKEY].
	fn send_err_badchannelkey(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	fn send_err_channelisfull(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	// TODO: ERR_TOOMANYCHANNELS
	#[allow(dead_code)]
	fn send_err_toomanychannels(&self) {}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> JoinErrorResponseInterface for Socket<'s>
{
	type Channel = Channel;

	fn send_err_badchannelkey(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_badchannelkey = ErrBadchannelkeyError {
			channel: channel_name,
			tags: ErrBadchannelkeyError::default_tags(),
			origin: &origin,
		};
		self.emit(err_badchannelkey.name(), err_badchannelkey);
	}

	fn send_err_channelisfull(
		&self,
		channel_name: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_channelisfull = ErrChannelisfullError {
			channel: channel_name,
			tags: ErrChannelisfullError::default_tags(),
			origin: &origin,
		};
		self.emit(err_channelisfull.name(), err_channelisfull);
	}
}
