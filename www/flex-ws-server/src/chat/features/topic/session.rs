// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::ChannelTopicError;
use crate::src::chat::components::{channel, client};
use crate::src::chat::sessions::ChannelsSession;

// --------- //
// Interface //
// --------- //

pub trait TopicChannelsSessionInterface
{
	/// Est-ce qu'un client PEUT éditer un topic.
	fn is_client_can_edit_topic(
		&self,
		channel_id: impl AsRef<str>,
		client_id: &client::ClientID,
	) -> Result<(), ChannelTopicError>;

	fn update_topic(
		&self,
		channel_id: impl AsRef<str>,
		topic: impl AsRef<str>,
		updated_by: impl ToString,
	) -> Option<channel::topic::ChannelTopic>;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl TopicChannelsSessionInterface for ChannelsSession
{
	fn is_client_can_edit_topic(
		&self,
		channel_id: impl AsRef<str>,
		client_id: &client::ClientID,
	) -> Result<(), ChannelTopicError>
	{
		let Some(channel) = self.get(channel_id) else {
			return Err(ChannelTopicError::Notonchannel);
		};

		let topic_flag = channel.modes_settings.has_topic_flag();

		let Some(channel_nick) = channel.members().get(client_id) else {
			if topic_flag {
				return Err(ChannelTopicError::Chanoprivsneeded);
			}
			return Ok(());
		};

		// NOTE(phisyx): tout le monde peut éditer le sujet du salon si le
		//               drapeau topic n'est pas définit.
		if !topic_flag {
			return Ok(());
		}

		// NOTE(phisyx): seuls les utilisateurs avec un niveau d'accès minimal à
		// 				 HalfOperator peuvent éditer le sujet du salon.
		let level_access = channel_nick
			.access_level()
			.iter()
			.fold(0, |acc, mode| mode.flag() | acc);

		if level_access <= channel::mode::ChannelAccessLevel::Vip.flag() {
			return Err(ChannelTopicError::Chanoprivsneeded);
		}
		Ok(())
	}

	/// Met à jour un topic.
	fn update_topic(
		&self,
		channel_id: impl AsRef<str>,
		topic: impl AsRef<str>,
		updated_by: impl ToString,
	) -> Option<channel::topic::ChannelTopic>
	{
		let mut channel = self.get_mut(channel_id)?;
		let topic = topic.as_ref();
		if topic == channel.topic.get() {
			return Some(channel.topic.clone());
		}
		if topic.trim().is_empty() {
			channel.topic.unset(updated_by);
		} else {
			channel.topic.set(topic, updated_by);
		}
		Some(channel.topic.clone())
	}
}
