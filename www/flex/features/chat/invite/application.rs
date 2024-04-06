// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::borrow::Cow;

use flex_chat_channel::{
	Channel,
	ChannelAccessControlInterface,
	ChannelInterface,
	ChannelsSessionInterface,
};
use flex_chat_client::{ClientInterface, ClientSocketInterface, Socket};

use crate::ChatApplication;

// --------- //
// Interface //
// --------- //

pub trait InviteApplicationInterface<'a>
where
	Self::Channel: 'a,
{
	type Channel: ChannelInterface;
	type ClientSocket<'cs>: ClientSocketInterface;

	/// Ajoute un utilisateur dans la liste des invitations d'un salon.
	fn add_user_to_invite_channel(
		&self,
		channel_id: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
		user_invite_id: <<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
	);
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'a> InviteApplicationInterface<'a> for ChatApplication
{
	type Channel = Channel;
	type ClientSocket<'cs> = Socket<'cs>;

	fn add_user_to_invite_channel(
		&self,
		channel_id: impl Into<
			Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>,
		>,
		user_invite_id: <<Self::ClientSocket<'_> as ClientSocketInterface>::Client as ClientInterface>::ClientID,
	)
	{
		let chid: &<Self::Channel as ChannelInterface>::RefID<'a> =
			&channel_id.into();
		let Some(mut channel) = self.channels.get_mut(chid) else {
			return;
		};
		channel.add_invite(user_invite_id);
	}
}
