// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashMap;
use std::ops;

use flex_web_framework::types::secret;

use crate::src::chat::features::ApplyMode;

// -------- //
// Constant //
// -------- //

pub const CHANNEL_MODE_SETTINGS_KEY: char = 'k';
pub const CHANNEL_MODE_SETTINGS_MODERATE: char = 'm';
pub const CHANNEL_MODE_SETTINGS_NO_EXTERNAL_MESSAGES: char = 'n';
pub const CHANNEL_MODE_SETTINGS_NOTOPIC: char = 't';
pub const CHANNEL_MODE_SETTINGS_OPERONLY: char = 'O';
pub const CHANNEL_MODE_SETTINGS_SECRET: char = 's';

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
pub struct ChannelModes<F>
{
	/// Les modes de salon.
	modes: HashMap<String, ApplyMode<F>>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SettingsFlags
{
	/// Clé du salon, pour le rejoindre.
	Key(secret::Secret<String>),

	/// Salon en modéré.
	Moderate,
	/// Interdire les messages provenant des utilisateurs externes au salon.
	NoExternalMessages,
	/// Interdire le changement du sujet (topic) par les utilisateurs non
	/// opérateurs. Le niveau requis pour le changement: HalfOperator
	/// [AccessLevelFlag::HalfOperator].
	NoTopic,
	/// Salon réservé aux opérateurs globaux uniquement.
	OperOnly,
	/// Salon secret. Ces salons ne seront pas affiché dans la liste des salons.
	Secret,
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
			.values()
			.any(|mode| mode.flag == SettingsFlags::Key(key.to_owned()))
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +k <key>
	pub fn has_key_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::Key(_),
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +m
	pub fn has_moderate_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::Moderate,
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +n
	pub fn has_no_external_messages_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::NoExternalMessages,
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +O
	pub fn has_operonly_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::OperOnly,
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +s
	pub fn has_secret_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::Secret,
					..
				}
			)
		})
	}

	/// Est-ce que les paramètres du salon contiennent le drapeau +t
	pub fn has_topic_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::NoTopic,
					..
				}
			)
		})
	}
}

impl ChannelModes<SettingsFlags>
{
	pub fn set(
		&mut self,
		mode: impl Into<ApplyMode<SettingsFlags>>,
	) -> Option<ApplyMode<SettingsFlags>>
	{
		let mode: ApplyMode<SettingsFlags> = mode.into();
		let letter = mode.letter().to_string();
		self.modes.insert(letter, mode.clone());
		Some(mode)
	}

	pub fn unset(
		&mut self,
		mode: impl Into<ApplyMode<SettingsFlags>>,
	) -> Option<ApplyMode<SettingsFlags>>
	{
		let mode: ApplyMode<SettingsFlags> = mode.into();
		let letter = mode.letter().to_string();
		self.modes.remove(&letter);
		Some(mode)
	}
}

impl SettingsFlags
{
	/// Lettre associée au paramètre.
	pub fn letter(&self) -> char
	{
		match self {
			| Self::Key(_) => CHANNEL_MODE_SETTINGS_KEY,
			| Self::Moderate => CHANNEL_MODE_SETTINGS_MODERATE,
			| Self::NoExternalMessages => CHANNEL_MODE_SETTINGS_NO_EXTERNAL_MESSAGES,
			| Self::NoTopic => CHANNEL_MODE_SETTINGS_NOTOPIC,
			| Self::OperOnly => CHANNEL_MODE_SETTINGS_OPERONLY,
			| Self::Secret => CHANNEL_MODE_SETTINGS_SECRET,
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Default for ChannelModes<SettingsFlags>
{
	fn default() -> Self
	{
		let settings = HashMap::from_iter([
			(
				SettingsFlags::NoExternalMessages.to_string(),
				ApplyMode::new(SettingsFlags::NoExternalMessages),
			),
			(
				SettingsFlags::NoTopic.to_string(),
				ApplyMode::new(SettingsFlags::NoTopic),
			),
		]);

		Self { modes: settings }
	}
}

impl std::fmt::Display for ChannelModes<SettingsFlags>
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		let mode_settings: String = self.modes.keys().map(|letter| letter.to_string()).collect();
		write!(f, "{}", mode_settings)
	}
}

impl<T> ops::Deref for ChannelModes<T>
{
	type Target = HashMap<String, ApplyMode<T>>;

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

impl std::fmt::Display for SettingsFlags
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.letter())
	}
}
