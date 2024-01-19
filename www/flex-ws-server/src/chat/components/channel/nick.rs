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
pub enum ChannelAccessLevel
{
	/// Niveau d'accès Propriétaire.
	Owner,
	/// Niveau d'accès Opérateur Admin.
	AdminOperator,
	/// Niveau d'accès Opérateur.
	Operator,
	/// Niveau d'accès Demi Opérateur.
	HalfOperator,
	/// Niveau d'accès Voice / VIP.
	Vip,
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
}