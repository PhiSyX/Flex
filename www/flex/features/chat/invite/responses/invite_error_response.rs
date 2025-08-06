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

use crate::features::chat::invite::ErrInviteonlychanError;

// --------- //
// Interface //
// --------- //

pub trait InviteChannelClientSocketErrorReplies: ClientSocketInterface
{
	type Channel: ChannelInterface;

	fn send_err_inviteonlychan(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> InviteChannelClientSocketErrorReplies for Socket<'s>
{
	type Channel = Channel;

	fn send_err_inviteonlychan(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	)
	{
		let origin = Origin::from(self.client());
		let err_inviteonlychan = ErrInviteonlychanError {
			origin: &origin,
			tags: ErrInviteonlychanError::default_tags(),
			channel,
		};
		self.emit(err_inviteonlychan.name(), err_inviteonlychan);
	}
}
