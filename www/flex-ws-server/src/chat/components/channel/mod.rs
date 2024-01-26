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
pub mod permission;
pub mod topic;

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
			users: Default::default(),
			modes_settings: Default::default(),
			topic: Default::default(),
		}
	}

	/// Crée une nouvelle structure d'un salon avec des drapeaux.
	pub fn with_flags(
		mut self,
		flags: impl IntoIterator<Item = mode::ChannelMode<mode::SettingsFlags>>,
	) -> Self
	{
		self.modes_settings.extend(flags);
		self
	}
}

impl Channel
{
	/// Ajoute un membre au salon.
	pub fn add_member(&mut self, id: client::ClientID, nick: nick::ChannelNick)
	{
		self.users.insert(id, nick);
	}

	/// ID du salon.
	pub fn id(&self) -> String
	{
		self.name.to_lowercase()
	}

	/// Récupère un membre du salon.
	pub fn member(&self, id: &client::ClientID) -> Option<&nick::ChannelNick>
	{
		self.users.get(id)
	}

	/// Récupère un membre du salon.
	pub fn member_mut(&mut self, id: &client::ClientID) -> Option<&mut nick::ChannelNick>
	{
		self.users.get_mut(id)
	}

	/// Tous les membres du salon.
	pub fn members(&self) -> &HashMap<client::ClientID, nick::ChannelNick>
	{
		&self.users
	}

	/// Room Socket
	pub fn room(&self) -> String
	{
		format!("channel:{}", self.name.to_lowercase())
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

	/// Paramètres du salon.
	pub fn settings(&self) -> HashMap<char, mode::ChannelMode<mode::SettingsFlags>>
	{
		self.modes_settings
			.iter()
			.map(|mode| (mode.flag.letter(), mode.clone()))
			.collect()
	}

	/// Accès à la structure du sujet.
	pub fn topic(&self) -> &topic::ChannelTopic
	{
		&self.topic
	}

	/// Sujet du salon.
	pub fn topic_text(&self) -> &str
	{
		self.topic.get()
	}
}
