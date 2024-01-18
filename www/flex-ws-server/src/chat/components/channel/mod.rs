// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub mod mode;
pub mod nick;

use std::collections::HashMap;

use flex_web_framework::types::{secret, time};

use super::client;

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
	/// Les paramètres du salon.
	pub(crate) modes_settings: mode::ChannelModes<mode::SettingsFlags>,
	/// Liste des utilisateurs du salon.
	pub(crate) users: HashMap<client::ClientID, nick::ChannelNick>,
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
			users: Default::default(),
			modes_settings: Default::default(),
		}
	}

	/// Ajoute un membre au salon.
	pub fn add_member(&mut self, id: client::ClientID, nick: nick::ChannelNick)
	{
		self.users.insert(id, nick);
	}

	/// Tous les membres du salon.
	pub fn members(&self) -> &HashMap<client::ClientID, nick::ChannelNick>
	{
		&self.users
	}

	/// ID du salon.
	pub fn id(&self) -> String
	{
		self.name.to_lowercase()
	}

	/// Définit la clé du salon.
	pub fn set_key(&mut self, updated_by: &str, key: impl Into<secret::Secret<String>>)
	{
		self.modes_settings.insert(mode::ChannelMode {
			flag: mode::SettingsFlags::Key(key.into()),
			args: Default::default(),
			updated_by: updated_by.to_owned(),
			updated_at: time::Utc::now(),
		});
	}

	/// Room Socket
	pub fn room(&self) -> String
	{
		format!("channel:{}", self.name.to_lowercase())
	}
}
