// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::time;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Default)]
#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct ChannelTopic
{
	/// Le sujet.
	topic: String,
	/// Origine de la mis à jour du sujet.
	updated_by: String,
	/// Date de mis à jour du sujet.
	updated_at: time::DateTime<time::Utc>,
}

// -------------- //
// Implémentation //
// -------------- //

impl ChannelTopic
{
	/// Vérifie si le sujet est vide ou non.
	pub fn is_empty(&self) -> bool
	{
		self.topic.is_empty()
	}

	/// Sujet d'un salon.
	pub fn get(&self) -> &str
	{
		&self.topic
	}

	/// Définit le sujet d'un salon.
	pub fn set(&mut self, topic: impl ToString, updated_by: impl ToString)
	{
		self.updated_at = time::Utc::now();
		self.updated_by = updated_by.to_string();
		self.topic = topic.to_string();
	}

	/// Définit le sujet d'un salon comme étant vide.
	pub fn unset(&mut self, updated_by: impl ToString)
	{
		self.updated_at = time::Utc::now();
		self.updated_by = updated_by.to_string();
		self.topic = String::default();
	}

	/// Date de mis à jour du sujet.
	pub fn updated_at(&self) -> &time::DateTime<time::Utc>
	{
		&self.updated_at
	}

	/// Origine de la mis à jour du sujet.
	pub fn updated_by(&self) -> &str
	{
		&self.updated_by
	}
}
