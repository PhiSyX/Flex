// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::secret;

use crate::command_formdata;
use crate::macro_rules::command_formdata::validate_channel;

command_formdata! {
	struct CHANNEL_MODE
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		target: String,
		/// Les paramètres du salon à appliquer.
		modes: ChannelModesSettings,
	}
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ChannelModesSettings
{
	/// Liste des bannissements à retirer.
	#[serde(rename = "b")]
	pub bans: Option<Vec<String>>,
	/// Salon sur invitation uniquement.
	#[serde(rename = "i")]
	pub invite_only: Option<bool>,
	/// Clé du salon, pour le rejoindre.
	#[serde(rename = "k")]
	pub key: Option<secret::Secret<String>>,
	/// Salon en modéré.
	#[serde(rename = "m")]
	pub moderate: Option<bool>,
	/// Interdire les messages provenant des utilisateurs externes au salon.
	#[serde(rename = "n")]
	pub no_external_messages: Option<bool>,
	/// Interdire le changement du sujet (topic) par les utilisateurs non
	/// opérateurs.
	#[serde(rename = "t")]
	pub no_topic: Option<bool>,
	/// Salon réservé aux opérateurs globaux uniquement.
	#[serde(rename = "O")]
	pub oper_only: Option<bool>,
	/// Salon secret. Ces salons ne seront pas affiché dans la liste des salons.
	#[serde(rename = "s")]
	pub secret: Option<bool>,
}
