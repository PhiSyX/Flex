// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::user::{
	DoNicknameFnOptions,
	NICK_MAX_SIZE,
	do_nickname,
	do_nickname_with_config,
};

// -------- //
// Fonction //
// -------- //

pub fn validate_nickname<'de, D>(de: D) -> Result<String, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;

	let s = String::deserialize(de)?;

	match do_nickname_with_config(
		&s,
		DoNicknameFnOptions {
			max_size: NICK_MAX_SIZE,
			reserved_list: vec![String::from("flex")],
		},
	) {
		| Ok(s) => Ok(s.to_owned()),
		| Err(_) => {
			Err(serde::de::Error::custom(format!(
				"Le nom « {s} » est incorrect"
			)))
		}
	}
}

pub fn validate_nicknames<'de, D>(de: D) -> Result<Vec<String>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;

	let v = Vec::<String>::deserialize(de)?;

	let nicks =
		v.iter().filter_map(|n| do_nickname(n).map(Into::into).ok()).collect();

	Ok(nicks)
}
