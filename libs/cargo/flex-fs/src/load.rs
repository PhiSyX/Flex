// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::{fmt, fs, io, path};

use crate::error::mapped_to_io_invalid_data_err;
use crate::Extension;

// -------- //
// Fonction //
// -------- //

/// Charge un fichier à partir d'un dossier, et le dé-sérialise en un type donné
/// par générique.
pub fn load<T>(
	directory: impl AsRef<path::Path>,
	filename: impl fmt::Display,
	extension: impl Into<Extension> + fmt::Display,
) -> io::Result<T>
where
	T: serde::de::DeserializeOwned,
{
	let fullpath = path::Path::new(directory.as_ref())
		.join(format!("{filename}.{extension}"));

	match extension.into() {
		| Extension::ENV => {
			let content = fs::read_to_string(fullpath)?;
			flex_env::from_str(&content).map_err(mapped_to_io_invalid_data_err)
		}

		| Extension::JSON => {
			let fd = fs::File::open(fullpath)?;
			serde_json::from_reader(fd).map_err(mapped_to_io_invalid_data_err)
		}

		| Extension::TOML => {
			let content = fs::read_to_string(fullpath)?;
			serde_toml::from_str(&content)
				.map_err(mapped_to_io_invalid_data_err)
		}

		| Extension::YAML => {
			let fd = fs::File::open(fullpath)?;
			serde_yaml::from_reader(fd).map_err(mapped_to_io_invalid_data_err)
		}
	}
}
