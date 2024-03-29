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

use dashmap::mapref::one::{Ref, RefMut};
use dashmap::DashMap;
use flex_chat_channel::{
	Channel,
	ChannelAccessLevel,
	ChannelInterface,
	ChannelMember,
	ChannelMemberInterface,
	ChannelSettingsInterface,
	ChannelsSessionInterface,
	MemberInterface,
};
use flex_chat_client::{Client, ClientsChannelSessionInterface};
use flex_chat_mode::ApplyMode;
use flex_web_framework::types::secret;

use super::ClientsSession;
use crate::features::ChatApplication;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ChannelsSession(DashMap<String, Channel>);

// -------------- //
// Implémentation //
// -------------- //

impl ChatApplication
{
	/// Récupère un salon à partir de son nom.
	pub fn get_channel(&self, channel_name: &str) -> Option<Ref<'_, String, Channel>>
	{
		self.channels.get(channel_name)
	}
}

impl ClientsChannelSessionInterface for ClientsSession
{
	type Client = Client;

	fn add_channel_on_client(
		&self,
		client_id: &<Self::Client as flex_chat_client::ClientInterface>::ClientID,
		channel_id: &str,
	)
	{
		let chid = channel_id.to_lowercase();
		let mut member = self.clients.get_mut(client_id).unwrap();
		member.channels.insert(chid);
	}

	fn remove_channel_on_client(
		&self,
		client_id: &<Self::Client as flex_chat_client::ClientInterface>::ClientID,
		channel_id: &str,
	)
	{
		let chid = channel_id.to_lowercase();
		let mut member = self.clients.get_mut(client_id).unwrap();
		member.channels.remove(&chid);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ChannelsSessionInterface for ChannelsSession
{
	type Channel = Channel;

	fn add(
		&self,
		channel_id: <Self::Channel as ChannelInterface>::OwnedID,
		channel: Self::Channel,
	) -> bool
	{
		self.0.insert(channel_id.to_lowercase(), channel).is_some()
	}

	fn add_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> Option<RefMut<'_, String, Channel>>
	{
		let mut channel_entity = self.get_mut(channel_id)?;

		if channel_entity.members().is_empty() {
			channel_entity.add_member(
				member_id.to_owned(),
				ChannelMember::new(member_id.to_owned()).with_modes([ChannelAccessLevel::Owner]),
			);
		} else {
			channel_entity.add_member(
				member_id.to_owned(),
				ChannelMember::new(member_id.to_owned()),
			);
		}

		Some(channel_entity)
	}

	fn create(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		channel_key: Option<<Self::Channel as ChannelInterface>::Key>,
	) -> bool
	{
		let chid = channel_id.to_owned().to_lowercase();
		let mut channel_entity = Channel::new(channel_id.to_owned());
		if let Some(channel_key) = channel_key {
			channel_entity.set_key("*", channel_key);
		}
		self.add(chid, channel_entity)
	}

	fn create_with_flags<'a>(
		&self,
		channel_name: impl Into<Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>>>,
		channel_key: Option<secret::Secret<String>>,
		flags: impl IntoIterator<
			Item = ApplyMode<<Self::Channel as ChannelSettingsInterface>::SettingsFlag>,
		>,
	) -> bool
	{
		let channel_name: Cow<'a, <Self::Channel as ChannelInterface>::RefID<'a>> = channel_name.into();
		let chid = channel_name.to_lowercase();
		let mut channel_entity = Channel::new(channel_name).with_creation_flags(flags);
		if let Some(channel_key) = channel_key {
			channel_entity.set_key("*", channel_key);
		}
		self.add(chid, channel_entity)
	}

	fn get(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<Ref<'_, <Self::Channel as ChannelInterface>::OwnedID, Self::Channel>>
	{
		let chid = channel_id.to_lowercase();
		self.0.get(&chid)
	}

	fn get_mut(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<RefMut<'_, <Self::Channel as ChannelInterface>::OwnedID, Self::Channel>>
	{
		let chid = channel_id.to_lowercase();
		self.0.get_mut(&chid)
	}

	fn get_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> Option<<Self::Channel as ChannelMemberInterface>::Member>
	{
		let channel_entity = self.get(channel_id)?;
		channel_entity.members().get(member_id).cloned()
	}

	fn has(&self, channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>) -> bool
	{
		let chid = channel_id.to_lowercase();
		self.0.contains_key(&chid)
	}

	fn has_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> bool
	{
		self.get(channel_id)
			.filter(|channel| channel.members().contains_key(member_id))
			.is_some()
	}

	fn list(
		&self,
	) -> dashmap::iter::Iter<'_, <Self::Channel as ChannelInterface>::OwnedID, Self::Channel>
	{
		self.0.iter()
	}

	fn remove(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
	) -> Option<(<Self::Channel as ChannelInterface>::OwnedID, Self::Channel)>
	{
		let chid = channel_id.to_lowercase();
		self.0.remove(&chid)
	}

	fn remove_member(
		&self,
		channel_id: &<Self::Channel as ChannelInterface>::RefID<'_>,
		member_id: &<<Self::Channel as ChannelMemberInterface>::Member as MemberInterface>::ID,
	) -> Option<()>
	{
		let mut channel_entity = self.get_mut(channel_id)?;
		channel_entity.members_mut().remove(member_id);
		if channel_entity.members().is_empty() {
			drop(channel_entity);
			self.remove(channel_id);
			return None;
		}
		Some(())
	}
}
