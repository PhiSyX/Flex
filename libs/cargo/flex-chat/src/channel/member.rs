// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashSet;

use crate::channel::mode::ChannelAccessLevel;
use crate::channel::MemberInterface;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct ChannelMember<ID>
{
	/// ID faisant référence à un client utilisateur.
	member_id: ID,
	/// Les niveaux d'accès liés au membre du salon.
	access_level: HashSet<ChannelAccessLevel>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<ID> ChannelMember<ID>
{
	/// Crée la structure [ChannelMember]
	pub fn new(member_id: <Self as MemberInterface>::ID) -> Self
	where
		ID: ToString,
	{
		Self {
			member_id,
			access_level: Default::default(),
		}
	}

	/// Crée la structure [ChannelMember] avec ses modes.
	pub fn with_modes(
		mut self,
		it: impl IntoIterator<Item = ChannelAccessLevel>,
	) -> Self
	{
		self.access_level = HashSet::from_iter(it);
		self
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<ID> MemberInterface for ChannelMember<ID>
where
	ID: ToString,
{
	type ID = ID;

	fn access_level(&self) -> &HashSet<ChannelAccessLevel>
	{
		&self.access_level
	}

	fn id(&self) -> &Self::ID
	{
		&self.member_id
	}

	fn highest_access_level(&self) -> Option<&ChannelAccessLevel>
	{
		if self.access_level.is_empty() {
			return None;
		}

		let last = self.access_level.iter().last();

		let highest =
			self.access_level.iter().fold(last, |maybe_level, level| {
				(level.flag() >= maybe_level?.flag())
					.then_some(level)
					.or(maybe_level)
			});

		highest
	}

	#[rustfmt::skip]
	fn remove_access_level(&mut self, access_level: ChannelAccessLevel) -> bool
	{
		self.access_level.remove(&access_level)
	}

	#[rustfmt::skip]
	fn update_access_level(&mut self, access_level: ChannelAccessLevel) -> bool
	{
		self.access_level.insert(access_level)
	}
}
