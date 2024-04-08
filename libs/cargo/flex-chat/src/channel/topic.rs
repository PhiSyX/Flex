// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::channel::TopicInterface;

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
	updated_at: chrono::DateTime<chrono::Utc>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl TopicInterface for ChannelTopic
{
	fn get(&self) -> &str
	{
		&self.topic
	}

	fn is_empty(&self) -> bool
	{
		self.topic.is_empty()
	}

	fn set(&mut self, topic: impl ToString, updated_by: impl ToString)
	{
		self.updated_at = chrono::Utc::now();
		self.updated_by = updated_by.to_string();
		self.topic = topic.to_string();
	}

	fn unset(&mut self, updated_by: impl ToString)
	{
		self.updated_at = chrono::Utc::now();
		self.updated_by = updated_by.to_string();
		self.topic = String::default();
	}

	fn updated_at(&self) -> &chrono::DateTime<chrono::Utc>
	{
		&self.updated_at
	}

	fn updated_by(&self) -> &str
	{
		&self.updated_by
	}
}
