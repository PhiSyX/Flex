// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_chat_macro::command_formdata;
use flex_chat_user::{do_nickname_with_config, DoNicknameFnOptions, NICK_MAX_SIZE};

command_formdata! {
	struct SILENCE
	{
		/// Pseudonyme à ignorer pour le client.
		#[serde(deserialize_with = "validate_nickname_with_prefix")]
		nickname: String,
	}
}

pub fn validate_nickname_with_prefix<'de, D>(deserializer: D) -> Result<String, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;

	let s = String::deserialize(deserializer)?;

	if !s.starts_with(['-', '+']) {
		return Err(serde::de::Error::custom(
			"Un préfixe '-' ou '+' est attendu",
		));
	}

	do_nickname_with_config(
		&s[1..],
		DoNicknameFnOptions {
			max_size: NICK_MAX_SIZE,
			reserved_list: vec![String::from("flex")],
		},
	)
	.map(|_| s.to_owned())
	.map_err(|_| serde::de::Error::custom(format!("Le nom « {} » est incorrect", &s[1..])))
}
