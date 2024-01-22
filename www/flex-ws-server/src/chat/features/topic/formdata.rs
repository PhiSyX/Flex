// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::command_formdata;
use crate::macro_rules::command_formdata::validate_channel;

command_formdata! {
	struct TOPIC
	{
		/// Le salon qui DOIT recevoir la modification du sujet.
		#[serde(deserialize_with = "validate_channel")]
		channel: String,
		/// Sujet à modifier ou à supprimer s'il est vide.
		#[serde(default, deserialize_with = "validate_topic")]
		topic: Option<String>,
	}
}

/// Valide la valeur utilisateur d'un topic.
pub fn validate_topic<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let o = Option::<String>::deserialize(deserializer)?;
	Ok(o.filter(|s| s.trim().is_empty() || s.len() < 100))
}
