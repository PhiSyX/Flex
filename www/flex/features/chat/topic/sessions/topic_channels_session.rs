// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat::channel::{
	ChannelAccessControlBanInterface,
	ChannelAccessLevel,
	ChannelInterface,
	ChannelMemberInterface,
	ChannelTopicInterface,
	ChannelsSessionInterface,
	MemberInterface,
	TopicInterface,
};
use flex_chat::client::{Client, ClientInterface};

use crate::features::chat::sessions::ChannelsSession;
use crate::features::chat::topic::ChannelTopicError;

// --------- //
// Interface //
// --------- //

#[rustfmt::skip]
pub trait TopicChannelsSessionInterface
	: ChannelsSessionInterface
{
	type Client: ClientInterface;

	/// Est-ce qu'un client PEUT éditer un topic.
	fn is_client_can_edit_topic(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		client: &Self::Client,
	) -> Result<(), ChannelTopicError>;

	fn update_topic(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		topic: impl AsRef<str>,
		updated_by: impl ToString,
	) -> Option<<Self::Channel as ChannelTopicInterface>::Topic>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl TopicChannelsSessionInterface for ChannelsSession
{
	type Client = Client;

	fn is_client_can_edit_topic(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		client: &Self::Client,
	) -> Result<(), ChannelTopicError>
	{
		let Some(channel) = self.get(channel_id) else {
			return Err(ChannelTopicError::ERR_NOTONCHANNEL);
		};

		let topic_flag = channel.modes_settings.has_topic_flag();

		let Some(member) = channel.members().get(client.cid()) else {
			if topic_flag {
				return Err(ChannelTopicError::ERR_CHANOPRIVSNEEDED);
			}
			return Ok(());
		};

		// NOTE(phisyx): une personne bannie, membre du salon, ne peut pas
		// 				 définir un topic.
		if channel.is_banned(client.user()) {
			return Err(ChannelTopicError::ERR_BANNEDFROMCHAN);
		}

		// NOTE(phisyx): tout le monde peut éditer le sujet du salon si le
		//               drapeau topic n'est pas définit.
		if !topic_flag {
			return Ok(());
		}

		// NOTE(phisyx): seuls les utilisateurs avec un niveau d'accès minimal à
		// 				 HalfOperator peuvent éditer le sujet du salon.

		let level_access = member
			.access_level()
			.iter()
			.fold(0, |acc, mode| mode.flag() | acc);

		if level_access <= ChannelAccessLevel::Vip.flag() {
			return Err(ChannelTopicError::ERR_CHANOPRIVSNEEDED);
		}
		Ok(())
	}

	/// Met à jour un topic.
	fn update_topic(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		topic: impl AsRef<str>,
		updated_by: impl ToString,
	) -> Option<<Self::Channel as ChannelTopicInterface>::Topic>
	{
		let mut channel = self.get_mut(channel_id)?;
		let topic = topic.as_ref();
		if topic == channel.topic().get() {
			return Some(channel.topic().clone());
		}
		if topic.trim().is_empty() {
			channel.topic_mut().unset(updated_by);
		} else {
			channel.topic_mut().set(topic, updated_by);
		}
		Some(channel.topic().clone())
	}
}
