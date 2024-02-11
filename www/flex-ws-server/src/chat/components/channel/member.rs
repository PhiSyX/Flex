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

use super::mode::ChannelAccessLevel;
use crate::src::chat::components::client;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct ChannelMember
{
	/// ID faisant référence à un client utilisateur.
	member_id: client::ClientID,
	/// Les niveaux d'accès liés au membre du salon.
	pub(crate) access_level: HashSet<ChannelAccessLevel>,
}

// -------------- //
// Implémentation //
// -------------- //

impl ChannelMember
{
	/// Crée la structure [ChannelMember]
	pub fn new(member_id: client::ClientID) -> Self
	{
		Self {
			member_id,
			access_level: Default::default(),
		}
	}

	/// Crée la structure [ChannelMember] avec ses modes.
	pub fn with_modes(mut self, it: impl IntoIterator<Item = ChannelAccessLevel>) -> Self
	{
		self.access_level = HashSet::from_iter(it);
		self
	}
}

impl ChannelMember
{
	/// Les niveaux d'access d'un pseudo d'un salon.
	pub fn access_level(&self) -> &HashSet<ChannelAccessLevel>
	{
		&self.access_level
	}

	/// ID faisant référence à un [client](Client).
	pub fn member_id(&self) -> &client::ClientID
	{
		&self.member_id
	}

	/// Le niveau le plus élevé qu'à le lient
	pub fn highest_access_level(&self) -> Option<&ChannelAccessLevel>
	{
		if self.access_level.is_empty() {
			return None;
		}

		let last = self.access_level.iter().last();

		let highest: Option<&ChannelAccessLevel> =
			self.access_level.iter().fold(last, |maybe_level, level| {
				(level.flag() >= maybe_level?.flag())
					.then_some(level)
					.or(maybe_level)
			});

		highest
	}

	/// Supprime le niveau d'accès du pseudo.
	pub fn remove_access_level(&mut self, access_level: ChannelAccessLevel) -> bool
	{
		self.access_level.remove(&access_level)
	}

	/// Met à jour le niveau d'accès du pseudo.
	pub fn update_access_level(&mut self, access_level: ChannelAccessLevel) -> bool
	{
		self.access_level.insert(access_level)
	}
}
