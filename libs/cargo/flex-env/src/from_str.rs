// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::{Error, Result, declaration};

// -------- //
// Fonction //
// -------- //

/// Dé-sérialise une chaîne vers un type.
///
/// Cette fonction va tenter d'interpréter `s` comme le contenu d'un document
/// .env et de désérialiser `T` à partir de cette chaîne.
pub fn from_str<T>(source_env: &str) -> Result<T>
where
	T: serde::de::DeserializeOwned,
{
	let declarations = parse(source_env);

	for decl in declarations {
		let declaration::Declaration(decl_key, decl_value) = decl;
		unsafe {
			std::env::set_var(decl_key, decl_value);
		}
	}

	// NOTE: La crate `serde_env` n'a pas exporté son type d'erreur 🤦‍♂️.
	serde_env::from_env().map_err(|err| Error::Internal(err.to_string()))
}

#[inline]
fn parse(
	source_env: &'_ str,
) -> impl Iterator<Item = declaration::Declaration<'_>> + '_
{
	#[rustfmt::skip]
	let parse_decl = |declaration_raw| {
		declaration::Declaration::parse(declaration_raw).ok()
	};
	source_env.lines().filter_map(parse_decl)
}
