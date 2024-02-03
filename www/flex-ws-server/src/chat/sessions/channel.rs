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
use crate::src::chat::features::{ApplyMode, ChannelJoinError, ChannelTopicError};
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
	/// Est-ce que le client courant a le droit demandé sur le salon.
	pub fn does_client_have_rights_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		min_access_level: nick::ChannelAccessLevel,
	) -> bool
	{
		let is_ok = self.channels.does_client_have_rights(
			channel_name,
			client_socket.cid(),
			min_access_level,
		);
		if !is_ok {
			client_socket.send_err_chanoprivsneeded(channel_name);
		}
		is_ok
	}

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

	/// Est-ce que le client PEUT éditer le sujet d'un salon.
	pub fn is_client_can_edit_topic(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	) -> bool
	{
		let is_client_operator = self.is_client_global_operator(client_socket);

		if is_client_operator {
			return true;
		}

		match self
			.channels
			.is_client_can_edit_topic(channel_name, client_socket.cid())
		{
			| Ok(_) => true,
			| Err(err) => {
				match err {
					| ChannelTopicError::Notonchannel => {
						client_socket.send_err_notonchannel(channel_name);
					}
					| ChannelTopicError::Chanoprivsneeded => {
						client_socket.send_err_chanoprivsneeded(channel_name);
					}
				};
				false
			}
		}
	}

	/// Rejoint un salon.
	pub fn join_channel(
		&self,
		client_socket: &client::Socket,
		channel: &channel::Channel,
		forced: bool,
	)
	{
		self.clients
			.add_channel(client_socket.cid(), channel.id().as_str());

		client_socket.emit_join(channel, forced, |channel_nick| {
			let client = self.clients.get(channel_nick.id())?;
			Some(crate::src::chat::replies::ChannelNickClient::from((
				client,
				channel_nick,
			)))
		});
	}

	/// Rejoint un salon ou le crée.
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
			self.join_channel(client_socket, &channel, false);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();

		let can_join = self
			.channels
			.can_join(channel_name, channel_key, &client_session);

		if can_join.is_ok() {
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, false);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| ChannelJoinError::BadChannelKey => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| ChannelJoinError::HasAlreadyClient => {}
				| ChannelJoinError::OperOnly => {
					client_socket.send_err_operonly(channel_name);
				}
			}
		}
	}

	/// Rejoint un salon (opérateur) ou le crée.
	pub fn join_or_create_oper_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create_with_flags(
				channel_name,
				None,
				[
					ApplyMode::new(channel::mode::SettingsFlags::OperOnly),
					ApplyMode::new(channel::mode::SettingsFlags::Secret),
				],
			);
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, true);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();
		let can_join = self.channels.can_join(channel_name, None, &client_session);

		if can_join.is_ok() {
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, true);
			return;
		}

		if let Err(err) = can_join {
			match err {
				| ChannelJoinError::BadChannelKey => {
					client_socket.send_err_badchannelkey(channel_name);
				}
				| ChannelJoinError::HasAlreadyClient => {}
				| ChannelJoinError::OperOnly => {
					client_socket.send_err_operonly(channel_name);
				}
			}
		}
	}

	/// Rejoint un salon ou le crée (en bypassant la clé s'il y en a une).
	pub fn join_or_create_channel_bypass_key(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
	)
	{
		if !self.channels.has(channel_name) {
			self.channels.create(channel_name, None);
			let channel = self
				.channels
				.add_client(channel_name, client_socket.cid())
				.expect("Le salon que le client a rejoint");
			self.join_channel(client_socket, &channel, true);
		}

		let client_session = self.get_client_by_id(client_socket.cid()).unwrap();

		let can_join = self.channels.can_join(channel_name, None, &client_session);

		match can_join {
			| Ok(_) => {
				let channel = self
					.channels
					.add_client(channel_name, client_socket.cid())
					.expect("Le salon que le client a rejoint");
				self.join_channel(client_socket, &channel, true);
			}
			| Err(err) => {
				match err {
					| ChannelJoinError::BadChannelKey | ChannelJoinError::OperOnly => {
						let channel = self
							.channels
							.add_client(channel_name, client_socket.cid())
							.expect("Le salon que le client a rejoint");
						self.join_channel(client_socket, &channel, true);
					}
					| ChannelJoinError::HasAlreadyClient => {}
				}
			}
		}
	}

	/// Sanctionne un membre d'un salon
	pub fn kick_clients_on_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		knicks: &[String],
		comment: Option<&str>,
	)
	{
		// NOTE: utilisateur / opérateur global / membre du salon / opérateur du
		// salon / victime.

		let is_client_globop = self.is_client_global_operator(client_socket);

		// NOTE: opérateur global (2).

		if is_client_globop {
			for nickname in knicks.iter() {
				let Some(knick_client_socket) =
					self.find_socket_by_nickname(client_socket.socket(), nickname)
				else {
					client_socket.send_err_nosuchnick(nickname);
					continue;
				};

				// NOTE: la victime (1/5) n'est pas membre du salon (3).
				if !self
					.channels
					.has_client(channel_name, knick_client_socket.cid())
				{
					client_socket.send_err_usernotinchannel(channel_name, nickname);
					continue;
				}

				// NOTE: un opérateur global (2) PEUT sanctionner même s'il
				//       n'est pas présent dans le salon en question. Ce qui a
				//       pour conséquence que si le membre du salon (3) était
				//       seul dans le salon, le salon est supprimé.
				let channel_not_removed =
					self.remove_client_from_channel(channel_name, &knick_client_socket);

				if channel_not_removed.is_some() {
					let Some(channel) = self.channels.get(channel_name) else {
						client_socket.send_err_nosuchchannel(channel_name);
						continue;
					};

					client_socket.emit_kick(&channel, &knick_client_socket, comment);
				} else {
					// TODO: envoyer une SNotice de succès à l'opérateur global
					// (2).
				}
			}

			return;
		}

		// NOTE: utilisateur (1).

		// NOTE: l'utilisateur (1) n'est pas membre du salon.
		if !self.channels.has_client(channel_name, client_socket.cid()) {
			client_socket.send_err_notonchannel(channel_name);
			return;
		}

		// NOTE: le membre du salon (3) n'a pas les droits minimales de
		// 		 sanctionner dans le salon.
		if !self.channels.does_client_have_rights(
			channel_name,
			client_socket.cid(),
			nick::ChannelAccessLevel::HalfOperator,
		) {
			client_socket.send_err_chanoprivsneeded(channel_name);
			return;
		}

		// NOTE: opérateur de salon (4) avec les bonnes permissions.

		for nickname in knicks.iter() {
			let Some(knick_client_socket) =
				self.find_socket_by_nickname(client_socket.socket(), nickname)
			else {
				client_socket.send_err_nosuchnick(nickname);
				continue;
			};

			// NOTE: la victime (1/5) n'est pas membre du salon (3).
			if !self
				.channels
				.has_client(channel_name, knick_client_socket.cid())
			{
				client_socket.send_err_usernotinchannel(channel_name, nickname);
				continue;
			}

			// NOTE: la victime (5) possède un drapeau 'q' dans ses drapeaux
			// 		 utilisateur (1) ce qui le rend non sanctionable d'un KICK.
			if knick_client_socket.user().has_nokick_flag() {
				client_socket.send_err_cannotkickglobops(channel_name, nickname);
				continue;
			}

			// NOTE: l'opérateur de salon (4) n'a pas les droits d'opérer sur la
			//       victime (5) qui se trouve être un opérateur de salon plus
			//       haut gradé (4).
			if !self
				.channels
				.does_client_have_rights_to_operate_on_another_client(
					channel_name,
					client_socket.cid(),
					knick_client_socket.cid(),
				) {
				client_socket.send_err_chanoprivsneeded(channel_name);
				continue;
			}

			// NOTE: nous sommes assuré par les conditions ci-hautes que
			//       l'opérateur de salon (4) est un membre du salon (3). Ce qui
			//       signifie que le salon NE PEUT PAS être supprimé après un
			//       KICK d'un membre de salon (3). Cependant, nous ne sommes
			//       pas assurer que l'opérateur de salon (4) se sanctionne
			//       lui-même. ;-)
			let channel_not_removed =
				self.remove_client_from_channel(channel_name, &knick_client_socket);

			if channel_not_removed.is_none() {
				client_socket.emit_self_kick(channel_name, &knick_client_socket, comment);
				return;
			}

			// NOTE: cela ne devrait jamais arriver à ce stade, mais sait-on
			// 		 jamais.
			let Some(channel) = self.channels.get(channel_name) else {
				client_socket.send_err_nosuchchannel(channel_name);
				continue;
			};

			client_socket.emit_kick(&channel, &knick_client_socket, comment);
		}
	}

	/// Supprime un client d'un salon. Si le salon n'a plus de membre, il sera
	/// également supprimé.
	pub fn remove_client_from_channel(
		&self,
		channel_name: &str,
		client_socket: &client::Socket,
	) -> Option<()>
	{
		self.clients
			.remove_channel(client_socket.cid(), channel_name);
		self.channels
			.remove_client(channel_name, client_socket.cid())
	}

	/// Supprime le client courant de tous ses salons.
	pub fn remove_client_from_all_his_channels(&self, client_socket: &client::Socket)
	{
		self.channels
			.remove_client_from_all_his_channels(client_socket.client());

		for channel_room in client_socket.channels_rooms() {
			let channel_name = &channel_room[8..];
			client_socket.emit_part(channel_name, Some("/partall"), None);
		}
	}

	fn internal_part_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		message: Option<&str>,
		forced: Option<&str>,
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

		client_socket.emit_part(channel_name, message, forced)
	}

	/// Part d'un salon
	pub fn part_channel(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		message: Option<&str>,
	)
	{
		self.internal_part_channel(client_socket, channel_name, message, None)
	}

	/// Force un utilisateur à quitter un salon.
	pub fn force_part_channel(
		&self,
		client_socket: &client::Socket,
		force_to_part: &client::Socket,
		channel_name: channel::ChannelIDRef,
		message: Option<&str>,
	)
	{
		self.internal_part_channel(
			force_to_part,
			channel_name,
			message,
			Some(&client_socket.user().nickname),
		)
	}

	/// Met à jour les niveaux d'accès d'un client sur un salon.
	pub fn update_client_access_level_on_channel(
		&self,
		client_socket: &client::Socket,
		channel: channel::ChannelIDRef,
		set_access_level: nick::ChannelAccessLevel,
	) -> Option<nick::ChannelNick>
	{
		self.channels
			.update_client_access_level(channel, client_socket.cid(), set_access_level)
	}

	/// Met à jour le sujet d'un salon.
	pub fn update_topic(
		&self,
		client_socket: &client::Socket,
		channel_name: channel::ChannelIDRef,
		topic: &str,
	)
	{
		self.channels
			.update_topic(channel_name, topic, &client_socket.user().nickname);

		let Some(channel) = self.get_channel(channel_name) else {
			return;
		};

		client_socket.send_rpl_topic(&channel, true);
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
		client: &client::Client,
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

		if self.has_client(channel_id, client.id()) {
			return Err(ChannelJoinError::HasAlreadyClient);
		}

		if channel.modes_settings.has_operonly_flag() && !client.user().is_operator() {
			return Err(ChannelJoinError::OperOnly);
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
		let mut channel_entity = channel::Channel::new(channel_name).with_flags(flags);
		if let Some(channel_key) = maybe_channel_key {
			channel_entity.set_key("*", channel_key);
		}
		self.add(&channel_id, channel_entity)
	}

	/// Est-ce qu'un client à des droits minimal.
	pub fn does_client_have_rights(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
		min_access_level: nick::ChannelAccessLevel,
	) -> bool
	{
		let Some(client) = self.get_client(channel_id, client_id) else {
			return false;
		};

		client
			.access_level()
			.iter()
			.any(|access_level| access_level.flag() >= min_access_level.flag())
	}

	/// Le client PEUT-il effectuer des tâches sur un autre client?
	pub fn does_client_have_rights_to_operate_on_another_client(
		&self,
		channel_id: channel::ChannelIDRef,
		client_id: &client::ClientID,
		user_id: &client::ClientID,
	) -> bool
	{
		let Some((client, user)) = self
			.get_client(channel_id, client_id)
			.zip(self.get_client(channel_id, user_id))
		else {
			return false;
		};

		let Some(chal) = client.highest_access_level() else {
			return false;
		};
		let Some(uhal) = user.highest_access_level() else {
			return chal.flag() >= nick::ChannelAccessLevel::HalfOperator.flag();
		};

		match chal {
			| nick::ChannelAccessLevel::Owner => true,
			| nick::ChannelAccessLevel::AdminOperator => {
				match uhal {
					| nick::ChannelAccessLevel::Owner | nick::ChannelAccessLevel::AdminOperator => {
						false
					}
					| _ => true,
				}
			}
			| nick::ChannelAccessLevel::Operator => {
				match uhal {
					| nick::ChannelAccessLevel::Owner | nick::ChannelAccessLevel::AdminOperator => {
						false
					}
					| _ => true,
				}
			}
			| nick::ChannelAccessLevel::HalfOperator => {
				match uhal {
					| nick::ChannelAccessLevel::Vip => true,
					| _ => false,
				}
			}
			| nick::ChannelAccessLevel::Vip => false,
		}
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

	/// Récupère un client d'un salon.
	pub fn get_client(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
	) -> Option<nick::ChannelNick>
	{
		let channel_entity = self.get(channel_id)?;
		channel_entity.members().get(client_id).cloned()
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

	/// Est-ce qu'un client PEUT éditer un topic.
	pub fn is_client_can_edit_topic(
		&self,
		channel_id: &str,
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

		let level_access = channel_nick
			.access_level()
			.iter()
			.fold(0, |acc, mode| mode.flag() | acc);

		if level_access <= nick::ChannelAccessLevel::Vip.flag() {
			return Err(ChannelTopicError::Chanoprivsneeded);
		}
		Ok(())
	}

	/// Liste des salons crées depuis le début de la session.
	pub fn list(&self) -> dashmap::iter::Iter<'_, String, channel::Channel>
	{
		self.0.iter()
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
			return None;
		}
		Some(())
	}

	/// Supprime le niveau d'accès d'un pseudo.
	pub fn remove_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: nick::ChannelAccessLevel,
	) -> Option<nick::ChannelNick>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_nick = channel.member_mut(client_id)?;
		channel_nick
			.remove_access_level(access_level)
			.then_some(channel_nick.clone())
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

	/// Met à jour le niveau d'accès d'un pseudo.
	pub fn update_client_access_level(
		&self,
		channel_id: &str,
		client_id: &client::ClientID,
		access_level: nick::ChannelAccessLevel,
	) -> Option<nick::ChannelNick>
	{
		let mut channel = self.get_mut(channel_id)?;
		let channel_nick = channel.member_mut(client_id)?;
		channel_nick
			.update_access_level(access_level)
			.then_some(channel_nick.clone())
	}

	/// Met à jour un topic.
	pub fn update_topic(
		&self,
		channel_id: &str,
		topic: &str,
		updated_by: &str,
	) -> Option<channel::topic::ChannelTopic>
	{
		let mut channel = self.get_mut(channel_id)?;
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
