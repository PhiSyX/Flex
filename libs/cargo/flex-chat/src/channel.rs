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

use flex_wildcard_matching::WildcardMatching;

pub use self::interface::*;
pub use self::member::*;
pub use self::mode::*;
pub use self::permission::*;
pub use self::topic::*;
pub use self::validation::*;
use crate::mode::{ApplyMode, Mask};
use crate::user::{User, UserAddressInterface, UserInterface};

// ---- //
// Type //
// ---- //

pub(crate) type ChannelName = String;
pub(crate) type ChannelNameRef = str;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct Channel<MemberID>
where
	MemberID: Clone,
	MemberID: ToString,
	MemberID: PartialEq + Eq + std::hash::Hash,
{
	/// Nom du salon.
	pub name: ChannelName,
	/// Les modes de contrôles d'accès
	pub access_control: AccessControl<MemberID>,
	/// Les paramètres du salon.
	pub modes_settings:
		ChannelModes<<Self as ChannelSettingsInterface>::SettingsFlag>,
	/// Liste des utilisateurs du salon.
	pub(crate) members: HashMap<
		<<Self as ChannelMemberInterface>::Member as MemberInterface>::ID,
		<Self as ChannelMemberInterface>::Member,
	>,
	/// Topic du salon.
	pub(crate) topic: <Self as ChannelTopicInterface>::Topic,
}

// -------------- //
// Implémentation //
// -------------- //

impl<ID> Channel<ID>
where
	ID: Default,
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
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

impl<ID> ChannelInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	type Key = String;
	type OwnedID = ChannelName;
	type RefID<'a> = ChannelNameRef where ID: 'a;

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

impl<ID> ChannelAccessControlInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	type ClientID = ID;
	type User = User;

	fn access_controls(&self) -> Vec<(char, ApplyMode<AccessControlMask>)>
	{
		let mut list = Vec::default();

		let banlist = self
			.access_control
			.banlist
			.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN, mode.clone()));

		let banlist_except = self
			.access_control
			.banlist_except
			.values()
			.map(|mode| (mode::CHANNEL_MODE_LIST_BAN_EXCEPT, mode.clone()));

		let invitelist_except =
			self.access_control.invitelist_except.values().map(|mode| {
				(mode::CHANNEL_MODE_LIST_INVITE_EXCEPT, mode.clone())
			});

		list.extend(banlist);
		list.extend(banlist_except);
		list.extend(invitelist_except);

		list
	}
}

impl<ID> ChannelAccessControlBanInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	fn add_ban(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
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

	fn has_banmask(&self, mask: &Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist.contains_key(&mask_s)
	}

	fn is_banned(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
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

	fn remove_ban(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban(mask_s)?;
		Some(mode)
	}
}

impl<ID> ChannelAccessControlBanExceptInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	fn add_ban_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
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

	fn has_banmask_except(&self, mask: &Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.banlist_except.contains_key(&mask_s)
	}

	fn isin_banlist_exception(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
	{
		#[rustfmt::skip]
		let check = |addr| {
			self.access_control.banlist_except.contains_key(&addr)
		};

		let check2 = || {
			self.access_control
				.banlist_except
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

	fn remove_ban_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.remove_ban_except(mask_s)?;
		Some(mode)
	}
}

impl<ID> ChannelAccessControlInviteExceptInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	fn add_invite_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<mode::AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.add_invite_except(mask_s, mode)
	}

	fn has_invitemask_except(&self, mask: &Mask) -> bool
	{
		let mask_s = mask.to_string();
		self.access_control.invitelist_except.contains_key(&mask_s)
	}

	fn isin_invitelist_exception(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
	{
		#[rustfmt::skip]
		let check = |addr| {
			self.access_control.invitelist_except.contains_key(&addr)
		};

		let check2 = || {
			self.access_control
				.invitelist_except
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

	fn remove_invite_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	{
		let mask = mask.into();
		let mask_s = mask.to_string();
		let mode = ApplyMode::new(mode::AccessControlMask::new(mask))
			.with_update_by(apply_by.nickname())
			.with_args([mask_s.clone()]);
		self.access_control.remove_invite_except(mask_s)?;
		Some(mode)
	}
}

impl<ID> ChannelAccessControlInviteInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
{
	fn add_invite(
		&mut self,
		client_id: <Self as ChannelAccessControlInterface>::ClientID,
	) -> bool
	{
		self.access_control.invite_list.insert(client_id)
	}

	fn remove_invite(
		&mut self,
		client_id: &<Self as ChannelAccessControlInterface>::ClientID,
	) -> bool
	{
		self.access_control.invite_list.remove(client_id)
	}
}

impl<ID> ChannelMemberInterface for Channel<ID>
where
	ID: Clone,
	ID: PartialEq + Eq + std::hash::Hash,
	ID: ToString,
{
	type Member = ChannelMember<ID>;

	/// Ajoute un membre au salon.
	fn add_member(
		&mut self,
		id: <Self::Member as MemberInterface>::ID,
		member: Self::Member,
	)
	{
		self.members.insert(id, member);
	}

	/// Récupère un membre du salon.
	fn member(
		&self,
		id: &<Self::Member as MemberInterface>::ID,
	) -> Option<&Self::Member>
	{
		self.members.get(id)
	}

	/// Récupère un membre du salon.
	fn member_mut(
		&mut self,
		id: &<Self::Member as MemberInterface>::ID,
	) -> Option<&mut Self::Member>
	{
		self.members.get_mut(id)
	}

	/// Tous les membres du salon.
	fn members(
		&self,
	) -> &HashMap<<Self::Member as MemberInterface>::ID, Self::Member>
	{
		&self.members
	}

	/// Tous les membres du salon (version mutable).
	fn members_mut(
		&mut self,
	) -> &mut HashMap<<Self::Member as MemberInterface>::ID, Self::Member>
	{
		&mut self.members
	}
}

impl<ID> ChannelSettingsInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
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

	fn set_key(&mut self, updated_by: &str, key: impl ToString)
	{
		self.modes_settings.insert(
			SettingsFlag::Key(Default::default()).to_string(),
			ApplyMode {
				flag: SettingsFlag::Key(key.to_string()),
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

impl<ID> ChannelTopicInterface for Channel<ID>
where
	ID: Clone,
	ID: ToString,
	ID: PartialEq + Eq + std::hash::Hash,
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
