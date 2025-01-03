// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::{HashMap, HashSet};

use crate::channel::ChannelAccessLevel;

// --------- //
// Interface //
// --------- //

pub trait ChannelMemberInterface
{
	/// Type représentant un objet d'un membre.
	type Member: MemberInterface;

	/// Ajoute un membre au salon.
	fn add_member(
		&mut self,
		member_id: <Self::Member as MemberInterface>::ID,
		member: Self::Member,
	);

	/// Récupère un membre du salon.
	fn member(
		&self,
		member_id: &<Self::Member as MemberInterface>::ID,
	) -> Option<&Self::Member>;

	/// Récupère un membre du salon.
	fn member_mut(
		&mut self,
		member_id: &<Self::Member as MemberInterface>::ID,
	) -> Option<&mut Self::Member>;

	/// Tous les membres du salon.
	fn members(
		&self,
	) -> &HashMap<<Self::Member as MemberInterface>::ID, Self::Member>;

	/// Tous les membres du salon (version mutable).
	fn members_mut(
		&mut self,
	) -> &mut HashMap<<Self::Member as MemberInterface>::ID, Self::Member>;
}

pub trait MemberInterface
{
	/// Type représentant l'ID d'un membre.
	type ID: ToString;

	/// Les niveaux d'access d'un membre d'un salon.
	fn access_level(&self) -> &HashSet<ChannelAccessLevel>;

	/// ID faisant référence à un [client](Client).
	fn id(&self) -> &Self::ID;

	/// Le niveau le plus élevé qu'à le membre.
	fn highest_access_level(&self) -> Option<&ChannelAccessLevel>;

	/// Supprime le niveau d'accès du membre.
	#[rustfmt::skip]
	fn remove_access_level(&mut self, access_level: ChannelAccessLevel) -> bool;

	/// Définit un ID d'un membre.
	fn set_id(&mut self, id: Self::ID);

	/// Met à jour le niveau d'accès du membre.
	#[rustfmt::skip]
	fn update_access_level(&mut self, access_level: ChannelAccessLevel) -> bool;
}
