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

use crate::src::chat::components::client;

// ---- //
// Type //
// ---- //

pub type CHANNEL_ACCESS_LEVEL_FLAG = u32;

// -------- //
// Constant //
// -------- //

/// Le drapeau du niveau d'accès des propriétaires de salon.
pub const CHANNEL_ACCESS_LEVEL_OWNER_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 7;

/// Le drapeau du niveau d'accès des admins de salon.
pub const CHANNEL_ACCESS_LEVEL_ADMIN_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 6;

/// Le drapeau du niveau d'accès des opérateurs de salon.
pub const CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 5;

/// Le drapeau du niveau d'accès des (demi) opérateurs de salon.
pub const CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 4;

/// Le drapeau du niveau d'accès des VIP's de salon.
pub const CHANNEL_ACCESS_LEVEL_VIP_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 3;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct ChannelNick
{
	/// ID faisant référence à un client.
	client_id: client::ClientID,
	/// Les modes liés au pseudo du salon.
	pub(crate) access_level: HashSet<ChannelAccessLevel>,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Serialize, serde::Deserialize)]
#[derive(PartialEq, Eq, Hash)]
#[repr(u32)]
pub enum ChannelAccessLevel
{
	/// Niveau d'accès Propriétaire.
	Owner = CHANNEL_ACCESS_LEVEL_OWNER_FLAG,
	/// Niveau d'accès Opérateur Admin.
	AdminOperator = CHANNEL_ACCESS_LEVEL_ADMIN_FLAG,
	/// Niveau d'accès Opérateur.
	Operator = CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG,
	/// Niveau d'accès Demi Opérateur.
	HalfOperator = CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG,
	/// Niveau d'accès Voice / VIP.
	Vip = CHANNEL_ACCESS_LEVEL_VIP_FLAG,
}

// -------------- //
// Implémentation //
// -------------- //

impl ChannelNick
{
	/// Crée la structure [ChannelNick]
	pub fn new(client_id: client::ClientID) -> Self
	{
		Self {
			client_id,
			access_level: Default::default(),
		}
	}

	/// Crée la structure [ChannelNick] avec ses modes.
	pub fn with_modes(mut self, it: impl IntoIterator<Item = ChannelAccessLevel>) -> Self
	{
		self.access_level = HashSet::from_iter(it);
		self
	}
}

impl ChannelNick
{
	/// ID faisant référence à un [client](Client).
	pub fn id(&self) -> &client::ClientID
	{
		&self.client_id
	}

	/// Les niveaux d'access d'un pseudo d'un salon.
	pub fn access_level(&self) -> &HashSet<ChannelAccessLevel>
	{
		&self.access_level
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
}

impl ChannelAccessLevel
{
	/// Drapeau d'un mode de salon pour un utilisateur.
	pub fn flag(&self) -> CHANNEL_ACCESS_LEVEL_FLAG
	{
		match self {
			| Self::Owner => CHANNEL_ACCESS_LEVEL_OWNER_FLAG,
			| Self::AdminOperator => CHANNEL_ACCESS_LEVEL_ADMIN_FLAG,
			| Self::Operator => CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG,
			| Self::HalfOperator => CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG,
			| Self::Vip => CHANNEL_ACCESS_LEVEL_VIP_FLAG,
		}
	}
}
