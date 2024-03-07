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

// -------- //
// Fonction //
// -------- //

pub fn validate_channel<'de, D>(deserializer: D) -> Result<Arc<str>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let s: Arc<str> = Arc::<str>::deserialize(deserializer)?;

	if s.is_empty() || s.len() > 30 || !s.starts_with('#') {
		return Err(serde::de::Error::custom(format!(
			"Le nom du salon « {s} » est incorrect"
		)));
	}

	Ok(s)
}

pub fn validate_channels<'de, D>(deserializer: D) -> Result<Vec<Arc<str>>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let v = Vec::<Arc<str>>::deserialize(deserializer)?;

	let chans = v
		.into_iter()
		.filter_map(|s| {
			if s.is_empty() || s.len() > 30 || !s.starts_with('#') {
				return None;
			}
			Some(s)
		})
		.collect();

	Ok(chans)
}
