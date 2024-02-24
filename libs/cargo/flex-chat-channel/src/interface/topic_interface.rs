// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

pub trait ChannelTopicInterface
{
	type Topic: TopicInterface;

	/// Accès à la structure du sujet.
	fn topic(&self) -> &Self::Topic;

	/// Accès à la structure du sujet (version mutable).
	fn topic_mut(&mut self) -> &mut Self::Topic;

	/// Sujet du salon.
	fn topic_text(&self) -> &str
	{
		self.topic().get()
	}
}

pub trait TopicInterface
{
	/// Récupère le sujet actuel.
	fn get(&self) -> &str;

	/// Vérifie si le sujet est vide ou non.
	fn is_empty(&self) -> bool;

	/// Définit le sujet d'un salon.
	fn set(&mut self, topic: impl ToString, updated_by: impl ToString);

	/// Définit le sujet d'un salon comme étant vide.
	fn unset(&mut self, updated_by: impl ToString);

	/// Date de mis à jour du sujet.
	fn updated_at(&self) -> &chrono::DateTime<chrono::Utc>;

	/// Origine de la mis à jour du sujet.
	fn updated_by(&self) -> &str;
}
