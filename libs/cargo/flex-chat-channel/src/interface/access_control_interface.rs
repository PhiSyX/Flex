// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_mode::ApplyMode;
use flex_chat_user::UserInterface;

use crate::Mask;

// --------- //
// Interface //
// --------- //

pub trait ChannelAccessControlInterface
{
	/// Type représentant les modes de contrôles d'accès.
	type AccessControlMask;

	/// Type représentant un ID d'un client.
	type ClientID;

	/// Type représentant un utilisateur.
	type User: UserInterface;

	/// Les contrôles d'accès.
	fn access_controls(&self) -> Vec<(char, ApplyMode<Self::AccessControlMask>)>;

	/// Ajoute un ban au salon.
	fn add_ban(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>;

	/// Ajoute une exception de ban au salon.
	fn add_ban_except(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>;

	/// Ajoute un utilisateur dans la liste des invitations du salon.
	fn add_invite(&mut self, id: Self::ClientID) -> bool;

	// Est-ce qu'une mask existe dans la liste des bans.
	fn has_banmask(&self, mask: &Mask) -> bool;

	// Est-ce qu'une mask existe dans la liste des exceptions de bans.
	fn has_banmask_except(&self, mask: &Mask) -> bool;

	/// Est-ce qu'un membre donné est banni du salon.
	fn is_banned(&self, user: &Self::User) -> bool;

	/// Est-ce qu'un membre donné est dans la liste des exceptions des
	/// bannissement
	fn isin_banlist_exception(&self, user: &Self::User) -> bool;

	/// Retire un ban du salon.
	fn remove_ban(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>;

	/// Retire une exception de ban du salon.
	fn remove_ban_except(
		&mut self,
		apply_by: &Self::User,
		mask: impl Into<Mask>,
	) -> Option<ApplyMode<Self::AccessControlMask>>;

	/// Retire un utilisateur de la liste des invitations
	fn remove_invite(&mut self, id: &Self::ClientID) -> bool;
}
