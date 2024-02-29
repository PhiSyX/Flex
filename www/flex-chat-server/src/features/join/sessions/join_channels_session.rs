// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_channel::{
	ChannelAccessControlInterface,
	ChannelInterface,
	ChannelsSessionInterface,
};
use flex_chat_client::{Client, ClientInterface};
use flex_chat_user::UserOperatorInterface;

use crate::src::features::join::JoinChannelPermissionError;
use crate::src::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait JoinChannelsSessionInterface: ChannelsSessionInterface
{
	type Client: ClientInterface;

	/// Est-ce qu'un client en session PEUT rejoindre le salon
	fn can_join(
		&self,
		client: &Self::Client,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		channel_key: Option<&<Self::Channel as ChannelInterface>::Key>,
	) -> Result<(), JoinChannelPermissionError>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl JoinChannelsSessionInterface for ChannelsSession
{
	type Client = Client;

	fn can_join(
		&self,
		client: &Self::Client,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		channel_key: Option<&<Self::Channel as ChannelInterface>::Key>,
	) -> Result<(), JoinChannelPermissionError>
	{
		let channel = self
			.get(channel_id)
			.ok_or(JoinChannelPermissionError::ERR_NOSUCHCHANNEL)?;

		if self.has_member(channel_id, client.cid()) {
			return Err(JoinChannelPermissionError::ERR_USERONCHANNEL);
		}

		if channel.is_banned(client.user()) {
			return Err(JoinChannelPermissionError::ERR_BANNEDFROMCHAN);
		}

		if channel.modes_settings.has_key_flag() {
			if let Some(user_channel_key) = channel_key {
				if !channel.modes_settings.contains_key_flag(user_channel_key) {
					return Err(JoinChannelPermissionError::ERR_BADCHANNELKEY);
				}
			} else {
				return Err(JoinChannelPermissionError::ERR_BADCHANNELKEY);
			}
		}

		if channel.modes_settings.has_invite_only_flag() {
			if channel.access_control.invite_list.contains(client.cid()) {
				return Ok(());
			}
			return Err(JoinChannelPermissionError::ERR_INVITEONLYCHAN);
		}

		if channel.modes_settings.has_operonly_flag() && !client.user().is_operator() {
			return Err(JoinChannelPermissionError::ERR_OPERONLY);
		}

		Ok(())
	}
}
