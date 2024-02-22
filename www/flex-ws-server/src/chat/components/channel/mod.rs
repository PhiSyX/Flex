// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub mod member;
pub mod mode;
pub mod permission;
pub mod topic;

use std::collections::{HashMap, HashSet};

use flex_web_framework::types::{secret, time};
use lexa_wildcard_matching::WildcardMatching;

use super::client;
use crate::src::chat::features::ApplyMode;

// ---- //
// Type //
// ---- //

pub type ChannelID = String;
pub type ChannelIDRef<'a> = &'a str;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct Channel
{
	/// Nom du salon.
	pub name: String,
	/// Les modes de contrôles d'accès
	pub(crate) access_control: mode::AccessControl,
	/// Les paramètres du salon.
	pub(crate) modes_settings: mode::ChannelModes<mode::SettingsFlags>,
	/// Liste des utilisateurs du salon.
	pub(crate) members: HashMap<client::ClientID, member::ChannelMember>,
	/// Topic du salon.
	pub(crate) topic: topic::ChannelTopic,
	/// Les utilisateurs en attente dans la liste des invitations.
	pub(crate) invite_list: HashSet<client::ClientID>,
}

// -------------- //
// Implémentation //
// -------------- //

impl Channel
{
	/// Crée une nouvelle structure d'un salon.
	pub fn new(name: impl ToString) -> Self
	{
		Self {
			name: name.to_string(),
			members: Default::default(),
			access_control: Default::default(),
			modes_settings: Default::default(),
			topic: Default::default(),
			invite_list: Default::default(),
		}
	}

	/// Crée une nouvelle structure d'un salon avec des drapeaux.
	pub fn with_creation_flags(
		mut self,
		flags: impl IntoIterator<Item = ApplyMode<mode::SettingsFlags>>,
	) -> Self
	{
		self.modes_settings
			.extend(flags.into_iter().map(|mode| (mode.flag.to_string(), mode)));
		self
	}
}

impl Channel
{
	/// Les contrôles d'accès.
	pub fn access_controls(&self) -> Vec<(char, ApplyMode<mode::AccessControlMode>)>
	{
		let mut list = Vec::default();

		let banlist = self
			.access_control
			.banlist
			.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN, mode.clone()));

		let banlist_exception = self
			.access_control
			.banlist_exceptions
			.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN_EXCEPT, mode.clone()));

		list.extend(banlist);
		list.extend(banlist_exception);

		list
	}

	/// Ajoute un ban au salon.
	pub fn add_ban(
		&mut self,
		apply_by: &super::User,
		mask: impl Into<mode::Mask>,
	) -> Option<ApplyMode<mode::AccessControlMode>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMode::new(mask))
			.with_update_by(&apply_by.nickname)
			.with_args([mask_s.clone()]);
		self.access_control.add_ban(mask_s, mode)
	}

	/// Ajoute une exception de ban au salon.
	pub fn add_ban_except(
		&mut self,
		apply_by: &super::User,
		mask: impl Into<mode::Mask>,
	) -> Option<ApplyMode<mode::AccessControlMode>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMode::new(mask))
			.with_update_by(&apply_by.nickname)
			.with_args([mask_s.clone()]);
		self.access_control.add_ban_except(mask_s, mode)
	}

	/// Ajoute un membre au salon.
	pub fn add_member(&mut self, id: client::ClientID, nick: member::ChannelMember)
	{
		self.members.insert(id, nick);
	}

	/// Ajoute un utilisateur dans la liste des invitations du salon.
	pub fn add_invite(&mut self, id: client::ClientID) -> bool
	{
		self.invite_list.insert(id)
	}

	// Est-ce qu'une mask existe dans la liste des bans.
	pub fn has_banmask(&self, mask: &mode::Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist.contains_key(&mask_s)
	}

	// Est-ce qu'une mask existe dans la liste des exceptions de bans.
	pub fn has_banmask_except(&self, mask: &mode::Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist_exceptions.contains_key(&mask_s)
	}

	/// ID du salon.
	pub fn id(&self) -> String
	{
		self.name.to_lowercase()
	}

	/// Est-ce qu'un membre donné est banni du salon.
	pub fn is_banned(&self, user: &super::User) -> bool
	{
		if self.isin_banlist_exception(user) {
			return false;
		}

		let check = |addr| self.access_control.banlist.contains_key(&addr);

		let check2 = || {
			self.access_control
				.banlist
				.keys()
				.any(|mask| user.full_address().iswm(mask))
		};

		check(user.address("*!*@*"))
			|| check(user.address("*!ident@*"))
			|| check(user.address("*!*ident@*"))
			|| check(user.address("*!ident@hostname"))
			|| check(user.address("*!*ident@hostname"))
			|| check(user.address("*!*@hostname"))
			|| check(user.address("*!*ident@*.hostname"))
			|| check(user.address("*!*@*.hostname"))
			|| check(user.address("nick!ident@hostname"))
			|| check(user.address("nick!*ident@hostname"))
			|| check(user.address("nick!*@hostname"))
			|| check(user.address("nick!*ident@*.hostname"))
			|| check(user.address("nick!*@*.hostname"))
			|| check(user.address("nick!*@*"))
			|| check2()
	}

	/// Est-ce qu'un membre donné est dans la liste des exceptions des
	/// bannissement
	pub fn isin_banlist_exception(&self, user: &super::User) -> bool
	{
		let check = |addr| self.access_control.banlist_exceptions.contains_key(&addr);

		let check2 = || {
			self.access_control
				.banlist_exceptions
				.keys()
				.any(|mask| user.full_address().iswm(mask))
		};

		check(user.address("*!*@*"))
			|| check(user.address("*!ident@*"))
			|| check(user.address("*!*ident@*"))
			|| check(user.address("*!ident@hostname"))
			|| check(user.address("*!*ident@hostname"))
			|| check(user.address("*!*@hostname"))
			|| check(user.address("*!*ident@*.hostname"))
			|| check(user.address("*!*@*.hostname"))
			|| check(user.address("nick!ident@hostname"))
			|| check(user.address("nick!*ident@hostname"))
			|| check(user.address("nick!*@hostname"))
			|| check(user.address("nick!*ident@*.hostname"))
			|| check(user.address("nick!*@*.hostname"))
			|| check(user.address("nick!*@*"))
			|| check2()
	}

	/// Récupère un membre du salon.
	pub fn member(&self, id: &client::ClientID) -> Option<&member::ChannelMember>
	{
		self.members.get(id)
	}

	/// Récupère un membre du salon.
	pub fn member_mut(&mut self, id: &client::ClientID) -> Option<&mut member::ChannelMember>
	{
		self.members.get_mut(id)
	}

	/// Tous les membres du salon.
	pub fn members(&self) -> &HashMap<client::ClientID, member::ChannelMember>
	{
		&self.members
	}

	/// Retire un ban du salon.
	pub fn remove_ban(
		&mut self,
		apply_by: &super::User,
		mask: impl Into<mode::Mask>,
	) -> Option<ApplyMode<mode::AccessControlMode>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMode::new(mask))
			.with_update_by(&apply_by.nickname)
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban(mask_s)?;
		Some(mode)
	}

	/// Retire une exception de ban du salon.
	pub fn remove_ban_except(
		&mut self,
		apply_by: &super::User,
		mask: impl Into<mode::Mask>,
	) -> Option<ApplyMode<mode::AccessControlMode>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMode::new(mask))
			.with_update_by(&apply_by.nickname)
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban_except(mask_s)?;
		Some(mode)
	}

	/// Retire un utilisateur de la liste des invitations
	pub fn remove_to_invite(&mut self, id: &client::ClientID) -> bool
	{
		self.invite_list.remove(id)
	}

	/// Room Socket
	pub fn room(&self) -> String
	{
		format!("channel:{}", self.name.to_lowercase())
	}

	/// Définit la clé du salon.
	pub fn set_key(&mut self, updated_by: &str, key: impl Into<secret::Secret<String>>)
	{
		self.modes_settings.insert(
			mode::SettingsFlags::Key(Default::default()).to_string(),
			ApplyMode {
				flag: mode::SettingsFlags::Key(key.into()),
				args: Default::default(),
				updated_by: updated_by.to_owned(),
				updated_at: time::Utc::now(),
			},
		);
	}

	/// Paramètres du salon.
	pub fn settings(&self) -> HashMap<char, ApplyMode<mode::SettingsFlags>>
	{
		self.modes_settings
			.values()
			.map(|mode| (mode.flag.letter(), mode.clone()))
			.collect()
	}

	/// Accès à la structure du sujet.
	pub fn topic(&self) -> &topic::ChannelTopic
	{
		&self.topic
	}

	/// Sujet du salon.
	pub fn topic_text(&self) -> &str
	{
		self.topic.get()
	}
}
