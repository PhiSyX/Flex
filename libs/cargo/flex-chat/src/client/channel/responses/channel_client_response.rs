// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::channel::{ChannelInterface, ChannelMemberInterface};
use crate::client::ClientSocketInterface;

// --------- //
// Interface //
// --------- //

pub trait ChannelClientSocketCommandResponse: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client les membres d'un salon par chunk de 300.
	fn send_rpl_namreply<DTO>(
		&self,
		channel: &Self::Channel,
		map_member: impl FnMut(
			&<Self::Channel as ChannelMemberInterface>::Member,
		) -> Option<DTO>,
	) where
		DTO: serde::Serialize + std::fmt::Debug;
}

pub trait ChannelClientSocketErrorReplies: ClientSocketInterface
{
	type Channel: ChannelInterface;

	/// Émet au client l'erreur [crate::ErrChanoprivsneededError].
	fn send_err_chanoprivsneeded(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	/// Émet au client l'erreur [crate::ErrNosuchchannelError].
	fn send_err_nosuchchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	/// Émet au client l'erreur [crate::ErrNotonchannelError].
	fn send_err_notonchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);

	/// Émet au client l'erreur [crate::ErrUsernotinchannelError].
	fn send_err_usernotinchannel(
		&self,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
		nick: &str,
	);

	/// Émet au client l'erreur [crate::ErrUseronchannelError].
	fn send_err_useronchannel(
		&self,
		user: &str,
		channel: &<Self::Channel as ChannelInterface>::RefID<'_>,
	);
}
