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

/// Valide la valeur utilisateur: filtre une valeur de type Arc<str>.
pub fn validate_string_filter<'de, D>(de: D) -> Result<Arc<str>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let s: Arc<str> = Arc::<str>::deserialize(de)?;
	if s.trim().is_empty() || s.len() > 1024 {
		return Err(serde::de::Error::custom(
			"La taille du buffer est invalide",
		));
	}
	Ok(s)
}

/// Valide la valeur utilisateur: filtre une valeur de type Option<Arc<str>>.
pub fn validate_opt_string_filter<'de, D>(
	de: D,
) -> Result<Option<Arc<str>>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let o = Option::<Arc<str>>::deserialize(de)?;
	Ok(o.filter(|s| !s.trim().is_empty() && s.len() < 1024))
}
