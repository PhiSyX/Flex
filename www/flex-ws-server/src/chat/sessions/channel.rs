// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use dashmap::mapref::one::{Ref, RefMut};
use dashmap::DashMap;
use flex_web_framework::types::secret;

use super::ClientsSession;
use crate::src::chat::components::channel::member;
use crate::src::chat::components::{channel, client};
use crate::src::chat::features::ApplyMode;
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ChannelsSession(DashMap<channel::ChannelID, channel::Channel>);

// -------------- //
// Implémentation //
// -------------- //

impl ChatApplication
{
	/// Récupère un salon à partir de son nom.
	pub fn get_channel(
		&self,
		channel_name: channel::ChannelIDRef,
	) -> Option<Ref<'_, channel::ChannelID, channel::Channel>>
	{
		self.channels.get(channel_name)
	}

	/// Est-ce qu'un client a un salon donné dans sa liste de salons rejoint.
	pub fn is_client_has_channel(&self, client_id: &client::ClientID, channel_name: &str) -> bool
	{
		let Some(client) = self.get_client_by_id(client_id) else {
			return false;
		};
		client.has_channel(channel_name)
	}

	/// Supprime un membre d'un salon. Si le salon n'a plus de membres, il sera
	/// également supprimé.
	pub fn remove_member_from_channel(
		&self,
		channel_name: &str,
		member_client_socket: &client::Socket,
	) -> Option<()>
	{
		self.clients
			.remove_channel(member_client_socket.cid(), channel_name);
		self.channels
			.remove_member(channel_name, member_client_socket.cid())
	}
}

impl ChannelsSession
{
	/// Ajoute un nouveau salon.
	pub fn add(&self, channel_id: &str, channel: channel::Channel) -> bool
	{
		let channel_id_lower = channel_id.to_lowercase();
		self.0.insert(channel_id_lower, channel).is_some()
	}

	/// Ajoute un nouveau membre à un salon.
	pub fn add_member(
		&self,
		channel_id: &str,
		member_id: &client::ClientID,
	) -> Option<RefMut<'_, channel::ChannelID, channel::Channel>>
	{
		let mut channel_entity = self.get_mut(channel_id)?;

		if channel_entity.members().is_empty() {
			channel_entity.add_member(
				member_id.to_owned(),
				member::ChannelMember::new(member_id.to_owned())
					.with_modes([channel::mode::ChannelAccessLevel::Owner]),
			);
		} else {
			channel_entity.add_member(
				member_id.to_owned(),
				member::ChannelMember::new(member_id.to_owned()),
			);
		}

		Some(channel_entity)
	}

	/// Crée un salon.
	pub fn create(
		&self,
		channel_name: impl ToString,
		maybe_channel_key: Option<secret::Secret<String>>,
	) -> bool
	{
		let channel_name = channel_name.to_string();
		let channel_id = channel_name.to_lowercase();
		let mut channel_entity = channel::Channel::new(channel_name);
		if let Some(channel_key) = maybe_channel_key {
			channel_entity.set_key("*", channel_key);
		}
		self.add(&channel_id, channel_entity)
	}

	/// Crée un salon avec des drapeaux.
	pub fn create_with_flags(
		&self,
		channel_name: impl ToString,
		maybe_channel_key: Option<secret::Secret<String>>,
		flags: impl IntoIterator<Item = ApplyMode<channel::mode::SettingsFlags>>,
	) -> bool
	{
		let channel_name = channel_name.to_string();
		let channel_id = channel_name.to_lowercase();
		let mut channel_entity = channel::Channel::new(channel_name).with_creation_flags(flags);
		if let Some(channel_key) = maybe_channel_key {
			channel_entity.set_key("*", channel_key);
		}
		self.add(&channel_id, channel_entity)
	}

	/// Récupère un salon.
	pub fn get(
		&self,
		channel_id: impl AsRef<str>,
	) -> Option<Ref<'_, channel::ChannelID, channel::Channel>>
	{
		let channel_id_lower = channel_id.as_ref().to_lowercase();
		let channel_entity = self.0.get(&channel_id_lower);
		channel_entity
	}

	/// Récupère un salon.
	pub fn get_mut(
		&self,
		channel_id: impl AsRef<str>,
	) -> Option<RefMut<'_, channel::ChannelID, channel::Channel>>
	{
		let channel_id_lower = channel_id.as_ref().to_lowercase();
		let channel_entity = self.0.get_mut(&channel_id_lower);
		channel_entity
	}

	/// Récupère un client d'un salon.
	pub fn get_member(
		&self,
		channel_id: &str,
		member_id: &client::ClientID,
	) -> Option<member::ChannelMember>
	{
		let channel_entity = self.get(channel_id)?;
		channel_entity.members().get(member_id).cloned()
	}

	/// Vérifie qu'un salon est existant ou non.
	pub fn has(&self, channel_id: &str) -> bool
	{
		let channel_id_lower = channel_id.to_lowercase();
		self.0.contains_key(&channel_id_lower)
	}

	/// Vérifie qu'un membre soit existant dans un salon.
	pub fn has_member(&self, channel_id: &str, member_id: &client::ClientID) -> bool
	{
		let Some(channel) = self.get(channel_id) else {
			return false;
		};
		channel.members().contains_key(member_id)
	}

	/// Liste des salons crées depuis le début de la session.
	pub fn list(&self) -> dashmap::iter::Iter<'_, channel::ChannelID, channel::Channel>
	{
		self.0.iter()
	}

	/// Supprime un salon.
	pub fn remove(
		&self,
		channel_id: channel::ChannelIDRef,
	) -> Option<(channel::ChannelID, channel::Channel)>
	{
		let channel_id_lower = channel_id.to_lowercase();
		self.0.remove(&channel_id_lower)
	}

	/// Supprime un membre d'un salon. Supprime le salon s'il n'y a plus aucun
	/// membres dedans.
	pub fn remove_member(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
	) -> Option<()>
	{
		let mut channel_entity = self.get_mut(channel_id)?;
		channel_entity.members.remove(client_id);
		if channel_entity.members.is_empty() {
			drop(channel_entity);
			self.remove(channel_id);
			return None;
		}
		Some(())
	}
}

impl ClientsSession
{
	/// Ajoute un salon pour un membre.
	pub fn add_channel(&self, member_id: &client::ClientID, channel_id: channel::ChannelIDRef)
	{
		let mut member = self.clients.get_mut(member_id).unwrap();
		member.channels.insert(channel_id.to_lowercase());
	}

	/// Supprime un salon pour un membre.
	pub fn remove_channel(&self, member_id: &client::ClientID, channel_id: channel::ChannelIDRef)
	{
		let channel_id_lower = channel_id.to_lowercase();
		let mut member = self.clients.get_mut(member_id).unwrap();
		member.channels.remove(&channel_id_lower);
	}
}
