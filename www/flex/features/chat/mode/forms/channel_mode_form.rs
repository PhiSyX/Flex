// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use flex_chat::channel::validate_channel;
use flex_chat::macros::command_formdata;
use flex_web_framework::types::secret;

command_formdata! {
	struct CHANNEL_MODE
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		target: Arc<str>,
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
	/// Liste des bannissements à appliquer/retirer.
	#[serde(rename = "b")]
	pub bans: Option<Vec<Arc<str>>>,
	/// Liste des exceptions de bannissements à appliquer/retirer.
	#[serde(rename = "e")]
	pub bans_except: Option<Vec<Arc<str>>>,
	/// Salon sur invitation uniquement.
	#[serde(rename = "i")]
	pub invite_only: Option<bool>,
	/// Liste des exceptions du mode d'invitation à appliquer/retirer.
	#[serde(rename = "I")]
	pub invites_except: Option<Vec<Arc<str>>>,
	/// Clé du salon, pour le rejoindre.
	#[serde(rename = "k")]
	pub key: Option<Arc<str>>,
	/// Nombre limite d'utilisateurs autorisés.
	#[serde(rename = "l")]
	pub limit: Option<u16>,
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
