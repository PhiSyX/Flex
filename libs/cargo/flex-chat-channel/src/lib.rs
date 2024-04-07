// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod interface;
mod member;
mod mode;
mod permission;
mod topic;
mod validation;

use std::collections::HashMap;

use flex_chat_mode::{ApplyMode, Mask};
use flex_chat_user::{User, UserAddressInterface, UserInterface};
use flex_secret::Secret;
use flex_wildcard_matching::WildcardMatching;

pub use self::interface::*;
pub use self::member::*;
pub use self::mode::*;
pub use self::permission::*;
pub use self::topic::*;
pub use self::validation::*;

// ---- //
// Type //
// ---- //

// TODO: à améliorer.
pub type UserID = uuid::Uuid;

pub(crate) type ChannelName = String;
pub(crate) type ChannelNameSRef<'a> = &'a str;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct Channel
{
	/// Nom du salon.
	pub name: ChannelName,
	/// Les modes de contrôles d'accès
	pub access_control: mode::AccessControl,
	/// Les paramètres du salon.
	pub modes_settings: mode::ChannelModes<mode::SettingsFlag>,
	/// Liste des utilisateurs du salon.
	pub(crate) members: HashMap<member::MemberID, member::ChannelMember>,
	/// Topic du salon.
	pub(crate) topic: topic::ChannelTopic,
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
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ChannelInterface for Channel
{
	type Key = Secret<String>;
	type OwnedID = ChannelName;
	type RefID<'a> = str;

	/// ID du salon.
	fn id(&self) -> Self::OwnedID
	{
		self.name.to_lowercase()
	}

	fn name(&self) -> &Self::RefID<'_>
	{
		&self.name
	}
}

impl ChannelAccessControlInterface for Channel
{
	type AccessControlMask = mode::AccessControlMask;
	type ClientID = UserID;
	type User = User;

	#[rustfmt::skip]
	fn access_controls(&self) -> Vec<(char, ApplyMode<Self::AccessControlMask>)>
	{
		let mut list = Vec::default();

		let banlist = self.access_control.banlist.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN, mode.clone()));

		let banlist_exception = self.access_control.banlist_exceptions.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN_EXCEPT, mode.clone()));

		list.extend(banlist);
		list.extend(banlist_exception);

		list
	}

	fn add_ban(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<mode::AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.add_ban(mask_s, mode)
	}

	fn add_ban_except(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<mode::AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.add_ban_except(mask_s, mode)
	}

	fn add_invite(&mut self, client_id: Self::ClientID) -> bool
	{
		self.access_control.invite_list.insert(client_id)
	}

	fn has_banmask(&self, mask: &Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist.contains_key(&mask_s)
	}

	fn has_banmask_except(&self, mask: &Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist_exceptions.contains_key(&mask_s)
	}

	/// Est-ce qu'un membre donné est banni du salon.
	fn is_banned(&self, user: &Self::User) -> bool
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
	fn isin_banlist_exception(&self, user: &Self::User) -> bool
	{
		#[rustfmt::skip]
		let check = |addr| {
			self.access_control.banlist_exceptions.contains_key(&addr)
		};

		#[rustfmt::skip]
		let check2 = || {
			self.access_control.banlist_exceptions.keys()
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

	/// Retire un ban du salon.
	fn remove_ban(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban(mask_s)?;
		Some(mode)
	}

	/// Retire une exception de ban du salon.
	fn remove_ban_except(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban_except(mask_s)?;
		Some(mode)
	}

	fn remove_invite(&mut self, client_id: &Self::ClientID) -> bool
	{
		self.access_control.invite_list.remove(client_id)
	}
}

impl ChannelMemberInterface for Channel
{
	type Member = ChannelMember;

	/// Ajoute un membre au salon.
	fn add_member(&mut self, id: member::MemberID, member: Self::Member)
	{
		self.members.insert(id, member);
	}

	/// Récupère un membre du salon.
	fn member(&self, id: &member::MemberID) -> Option<&Self::Member>
	{
		self.members.get(id)
	}

	/// Récupère un membre du salon.
	#[rustfmt::skip]
	fn member_mut(&mut self, id: &member::MemberID) -> Option<&mut Self::Member>
	{
		self.members.get_mut(id)
	}

	/// Tous les membres du salon.
	fn members(&self) -> &HashMap<member::MemberID, Self::Member>
	{
		&self.members
	}

	/// Tous les membres du salon (version mutable).
	fn members_mut(&mut self) -> &mut HashMap<member::MemberID, Self::Member>
	{
		&mut self.members
	}
}

impl ChannelSettingsInterface for Channel
{
	type SettingsFlag = SettingsFlag;

	fn with_creation_flags(
		mut self,
		flags: impl IntoIterator<Item = ApplyMode<Self::SettingsFlag>>,
	) -> Self
	{
		self.modes_settings.extend(
			flags.into_iter().map(|mode| (mode.flag.to_string(), mode)),
		);
		self
	}

	fn set_key(&mut self, updated_by: &str, key: impl Into<Secret<String>>)
	{
		self.modes_settings.insert(
			SettingsFlag::Key(Default::default()).to_string(),
			ApplyMode {
				flag: SettingsFlag::Key(key.into()),
				args: Default::default(),
				updated_by: updated_by.to_owned(),
				updated_at: chrono::Utc::now(),
			},
		);
	}

	fn settings(&self) -> HashMap<char, ApplyMode<Self::SettingsFlag>>
	{
		self.modes_settings
			.values()
			.map(|mode| (mode.flag.letter(), mode.clone()))
			.collect()
	}
}

impl ChannelTopicInterface for Channel
{
	type Topic = ChannelTopic;

	fn topic(&self) -> &Self::Topic
	{
		&self.topic
	}

	fn topic_mut(&mut self) -> &mut Self::Topic
	{
		&mut self.topic
	}
}
