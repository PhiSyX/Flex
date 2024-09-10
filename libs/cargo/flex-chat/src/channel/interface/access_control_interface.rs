// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::channel::AccessControlMask;
use crate::mode::{ApplyMode, Mask};
use crate::user::UserInterface;

// --------- //
// Interface //
// --------- //

#[rustfmt::skip]
pub trait ChannelAccessControlInterface
	: ChannelAccessControlBanInterface
	+ ChannelAccessControlBanExceptInterface
	+ ChannelAccessControlInviteInterface
{
	/// Type représentant un ID d'un client.
	type ClientID;

	/// Type représentant un utilisateur.
	type User: UserInterface;

	/// Les contrôles d'accès.
	fn access_controls(&self) -> Vec<(char, ApplyMode<AccessControlMask>)>;
}

pub trait ChannelAccessControlBanInterface
{
	/// Ajoute un ban au salon.
	fn add_ban(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;

	/// Est-ce qu'une mask existe dans la liste des bans.
	fn has_banmask(&self, mask: &Mask) -> bool;

	/// Est-ce qu'un membre donné est banni du salon.
	fn is_banned(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
	where
		Self: ChannelAccessControlInterface;

	/// Retire un ban du salon.
	fn remove_ban(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;
}

pub trait ChannelAccessControlBanExceptInterface
{
	/// Ajoute une exception de ban au salon.
	fn add_ban_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;

	/// Est-ce qu'une mask existe dans la liste des exceptions de bans.
	fn has_banmask_except(&self, mask: &Mask) -> bool;

	/// Est-ce qu'un membre donné est dans la liste des exceptions des
	/// bannissement
	fn isin_banlist_exception(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
	where
		Self: ChannelAccessControlInterface;

	/// Retire une exception de ban du salon.
	fn remove_ban_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;
}

pub trait ChannelAccessControlInviteExceptInterface
{
	/// Ajoute une exception d'invite au salon.
	fn add_invite_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;

	/// Est-ce qu'une mask existe dans la liste des exceptions d'invitations.
	fn has_invitemask_except(&self, mask: &Mask) -> bool;

	/// Est-ce qu'un membre donné est dans la liste des exceptions des
	/// invitations
	fn isin_invitelist_exception(
		&self,
		user: &<Self as ChannelAccessControlInterface>::User,
	) -> bool
	where
		Self: ChannelAccessControlInterface;

	/// Retire une exception de ban du salon.
	fn remove_invite_except(
		&mut self,
		apply_by: &<Self as ChannelAccessControlInterface>::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<AccessControlMask>>
	where
		Self: ChannelAccessControlInterface;
}

pub trait ChannelAccessControlInviteInterface
{
	/// Ajoute un utilisateur dans la liste des invitations du salon.
	fn add_invite(
		&mut self,
		id: <Self as ChannelAccessControlInterface>::ClientID,
	) -> bool
	where
		Self: ChannelAccessControlInterface;

	/// Retire un utilisateur de la liste des invitations
	fn remove_invite(
		&mut self,
		id: &<Self as ChannelAccessControlInterface>::ClientID,
	) -> bool
	where
		Self: ChannelAccessControlInterface;
}
