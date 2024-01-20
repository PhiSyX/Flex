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
use std::ops;

use flex_web_framework::types::secret;
use flex_web_framework::types::time::{DateTime, Utc};

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct ChannelModes<F>
{
	/// Les modes de salon.
	modes: HashSet<ChannelMode<F>>,
}

#[derive(Clone)]
#[derive(Debug)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize)]
pub struct ChannelMode<F>
{
	/// Drapeau d'un mode.
	pub flag: F,
	/// Les arguments d'un drapeau.
	pub args: Vec<String>,
	/// Par qui a été appliqué ce mode.
	pub updated_by: String,
	/// Quand a été appliqué ce mode.
	pub updated_at: DateTime<Utc>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SettingsFlags
{
	/// Clé du salon, pour le rejoindre.
	Key(secret::Secret<String>),

	/// Salon en modéré.
	Moderate,
	/// Interdire les messages provenant des utilisateurs externes au salon.
	NoExternalMessages,
}

// -------------- //
// Implémentation //
// -------------- //

impl ChannelModes<SettingsFlags>
{
	/// Vérifie que le drapeau +k <key> contienne la bonne clé.
	pub fn contains_key_flag(&self, key: &secret::Secret<String>) -> bool
	{
		self.modes
			.iter()
			.any(|mode| mode.flag == SettingsFlags::Key(key.to_owned()))
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +k <key>
	pub fn has_key_flag(&self) -> bool
	{
		self.modes.iter().any(|mode| {
			matches!(
				mode,
				ChannelMode {
					flag: SettingsFlags::Key(_),
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +m
	pub fn has_moderate_flag(&self) -> bool
	{
		self.modes.iter().any(|mode| {
			matches!(
				mode,
				ChannelMode {
					flag: SettingsFlags::Moderate,
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +n
	pub fn has_no_external_messages_flag(&self) -> bool
	{
		self.modes.iter().any(|mode| {
			matches!(
				mode,
				ChannelMode {
					flag: SettingsFlags::NoExternalMessages,
					..
				}
			)
		})
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Default for ChannelModes<SettingsFlags>
{
	fn default() -> Self
	{
		let settings = HashSet::from_iter([ChannelMode {
			flag: SettingsFlags::NoExternalMessages,
			args: Default::default(),
			updated_at: Utc::now(),
			updated_by: "*".into(),
		}]);

		Self { modes: settings }
	}
}

impl<T> ops::Deref for ChannelModes<T>
{
	type Target = HashSet<ChannelMode<T>>;

	fn deref(&self) -> &Self::Target
	{
		&self.modes
	}
}

impl<T> ops::DerefMut for ChannelModes<T>
{
	fn deref_mut(&mut self) -> &mut Self::Target
	{
		&mut self.modes
	}
}
