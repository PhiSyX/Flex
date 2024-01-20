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
use crate::src::chat::components::channel::nick;
use crate::src::chat::components::channel::permission::ChannelPermissionWrite;
use crate::src::chat::components::client::ClientSocketInterface;
use crate::src::chat::components::{channel, client};
use crate::src::ChatApplication;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct ChannelsSession(DashMap<channel::ChannelID, channel::Channel>);

// ----------- //
// Énumération //
// ----------- //

pub enum ChannelJoinError
{
	BadChannelKey,
	HasAlreadyClient,
}

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

	/// Le client peut-il écrire sur le salon?
	pub fn is_client_able_to_write_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	) -> ChannelPermissionWrite
	{
		let Some(channel) = self.get_channel(channel_name) else {
			return ChannelPermissionWrite::No;
		};

		let moderate_flag = channel.modes_settings.has_moderate_flag();
		let no_external_messages_flag = channel.modes_settings.has_no_external_messages_flag();

		// NOTE(phisyx): pour le futur, vérifier que celui qui essaie d'écrire
		// dans le salon n'est pas bannie.

		let Some(member) = channel.member(client_socket.cid()) else {
			if moderate_flag || no_external_messages_flag {
				return ChannelPermissionWrite::No;
			}

			return ChannelPermissionWrite::Bypass;
		};

		if moderate_flag
			&& member
				.highest_access_level()
				.filter(|level| level.flag() >= nick::ChannelAccessLevel::Vip.flag())
				.is_none()
		{
			return ChannelPermissionWrite::No;
		}

		ChannelPermissionWrite::Yes(member.clone())
	}

	/// Rejoint un salon.
	pub fn join_channel(&self, client_socket: &client::Socket, channel: &channel::Channel)
	{
		self.clients
			.add_channel(client_socket.cid(), channel.id().as_str());

		client_socket.emit_join(channel, false, |channel_nick| {
			let client = self.clients.find(channel_nick.id())?;
			Some(crate::src::chat::replies::ChannelNickClient::from((
				client,
				channel_nick,
			)))
		});
	}

	/// Rejointe un salon ou le crée.
	pub fn join_or_create_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		channel_key: Option<&secret::Secret<String>>,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, channel_key.cloned());
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel);
		}

		let can_join = self
			.channels
			.can_join(channel_name, channel_key, client_socket.cid());

		if can_join.is_ok() {
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| ChannelJoinError::BadChannelKey => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| ChannelJoinError::HasAlreadyClient => {}
			}
		}
	}

	/// Supprime le client courant de tous ses salons.
	pub fn remove_client_from_all_his_channels(&self, client_socket: &client::Socket)
	{
		self.channels
			.remove_client_from_all_his_channels(client_socket.client());

		for channel_room in client_socket.channels_rooms() {
			let channel_name = &channel_room[8..];
			client_socket.emit_part(channel_name, Some("/partall"));
		}
	}

	/// Part d'un salon
	pub fn part_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		message: Option<&str>,
	)
	{
		if !self.channels.has(channel_name) {
			client_socket.send_err_nosuchchannel(channel_name);
			return;
		}

		if !self.channels.has_client(channel_name, client_socket.cid()) {
			client_socket.send_err_notonchannel(channel_name);
			return;
		}

		self.channels
			.remove_client(channel_name, client_socket.cid());
		self.clients
			.remove_channel(client_socket.cid(), channel_name);

		client_socket.emit_part(channel_name, message)
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

	/// Ajoute un client à un salon.
	pub fn add_client(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
	) -> Option<RefMut<'_, channel::ChannelID, channel::Channel>>
	{
		let mut channel_entity = self.get_mut(channel_id)?;

		if channel_entity.members().is_empty() {
			channel_entity.add_member(
				client_id.to_owned(),
				nick::ChannelNick::new(client_id.to_owned())
					.with_modes([nick::ChannelAccessLevel::Owner]),
			);
		} else {
			channel_entity.add_member(
				client_id.to_owned(),
				nick::ChannelNick::new(client_id.to_owned()),
			);
		}

		Some(channel_entity)
	}

	/// Est-ce que le client PEUT rejoindre le salon
	pub fn can_join(
		&self,
		channel_id: channel::ChannelIDRef,
		maybe_user_channel_key: Option<&secret::Secret<String>>,
		client_id: &client::ClientID,
	) -> Result<(), ChannelJoinError>
	{
		let channel = self
			.get(channel_id)
			.expect("à cette étape, le salon DOIT forcément exister");

		if channel.modes_settings.has_key_flag() {
			if let Some(user_channel_key) = maybe_user_channel_key {
				if !channel.modes_settings.contains_key_flag(user_channel_key) {
					return Err(ChannelJoinError::BadChannelKey);
				}
			} else {
				return Err(ChannelJoinError::BadChannelKey);
			}
		}

		if self.has_client(channel_id, client_id) {
			return Err(ChannelJoinError::HasAlreadyClient);
		}

		Ok(())
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

	/// Vérifie qu'un salon est existant ou non.
	pub fn has(&self, channel_id: &str) -> bool
	{
		let channel_id_lower = channel_id.to_lowercase();
		self.0.contains_key(&channel_id_lower)
	}

	/// Vérifie qu'un client est existant dans un salon.
	pub fn has_client(&self, channel_id: &str, client_id: &client::ClientID) -> bool
	{
		let Some(channel) = self.get(channel_id) else {
			return false;
		};
		channel.members().contains_key(client_id)
	}

	/// Récupère un salon.
	pub fn get(&self, channel_id: &str) -> Option<Ref<'_, channel::ChannelID, channel::Channel>>
	{
		let channel_id_lower = channel_id.to_lowercase();
		let channel_entity = self.0.get(&channel_id_lower);
		channel_entity
	}

	/// Récupère un salon.
	pub fn get_mut(
		&self,
		channel_id: &str,
	) -> Option<RefMut<'_, channel::ChannelID, channel::Channel>>
	{
		let channel_id_lower = channel_id.to_lowercase();
		let channel_entity = self.0.get_mut(&channel_id_lower);
		channel_entity
	}

	/// Supprime un salon.
	pub fn remove(&self, channel_id: channel::ChannelIDRef) -> Option<(String, channel::Channel)>
	{
		let channel_id_lower = channel_id.to_lowercase();
		self.0.remove(&channel_id_lower)
	}

	/// Supprime un client d'un salon. Supprime le salon s'il n'y a plus aucun
	/// membres dedans.
	pub fn remove_client(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
	) -> Option<()>
	{
		let mut channel_entity = self.get_mut(channel_id)?;
		channel_entity.users.remove(client_id);
		if channel_entity.users.is_empty() {
			drop(channel_entity);
			self.remove(channel_id);
		}
		Some(())
	}

	/// Supprime un client de tous ses salons.
	pub fn remove_client_from_all_his_channels(&self, client: &client::Client) -> Option<()>
	{
		for channel_id in &client.channels {
			let mut channel = self.get_mut(channel_id)?;
			channel.users.remove(client.id());
		}
		Some(())
	}
}

impl ClientsSession
{
	/// Ajoute un salon pour un client.
	pub fn add_channel(&self, client_id: &client::ClientID, channel_id: channel::ChannelIDRef)
	{
		let mut client = self.clients.get_mut(client_id).unwrap();
		client.channels.insert(channel_id.to_lowercase());
	}

	/// Supprime un salon pour un client.
	pub fn remove_channel(&self, client_id: &client::ClientID, channel_id: channel::ChannelIDRef)
	{
		let channel_id_lower = channel_id.to_lowercase();
		let mut client = self.clients.get_mut(client_id).unwrap();
		client.channels.remove(&channel_id_lower);
	}
}
