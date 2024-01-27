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
use crate::macro_rules::command_formdata::{validate_channels, validate_nicknames};

command_formdata! {
	struct PART
	{
		/// Salons à quitter.
		#[serde(deserialize_with = "validate_channels")]
		channels: Vec<String>,
		/// Message part du client.
		message: Option<String>,
	}
}

command_formdata! {
	struct SAPART
	{
		/// Les pseudo à forcer de quitter les salons.
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
		/// Salons à quitter.
		#[serde(deserialize_with = "validate_channels")]
		channels: Vec<String>,
		/// Message part du client.
		message: Option<String>,
	}
}
