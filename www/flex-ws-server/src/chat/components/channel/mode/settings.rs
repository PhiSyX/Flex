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

use flex_web_framework::types::secret;

use super::ChannelModes;
use crate::src::chat::features::ApplyMode;

// -------- //
// Constant //
// -------- //

pub const CHANNEL_MODE_SETTINGS_KEY: char = 'k';
pub const CHANNEL_MODE_SETTINGS_INVITE_ONLY: char = 'i';
pub const CHANNEL_MODE_SETTINGS_MODERATE: char = 'm';
pub const CHANNEL_MODE_SETTINGS_NO_EXTERNAL_MESSAGES: char = 'n';
pub const CHANNEL_MODE_SETTINGS_NOTOPIC: char = 't';
pub const CHANNEL_MODE_SETTINGS_OPERONLY: char = 'O';
pub const CHANNEL_MODE_SETTINGS_SECRET: char = 's';

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
	/// Salon accessible sur invitation uniquement.
	InviteOnly,
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

	/// Est-ce que les paramètres du salon contiennent le drapeau +i
	pub fn has_invite_only_flag(&self) -> bool
	{
		self.modes.values().any(|mode| {
			matches!(
				mode,
				ApplyMode {
					flag: SettingsFlags::InviteOnly,
					..
				}
			)
		})
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
			| Self::InviteOnly => CHANNEL_MODE_SETTINGS_INVITE_ONLY,
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

impl std::fmt::Display for SettingsFlags
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.letter())
	}
}
