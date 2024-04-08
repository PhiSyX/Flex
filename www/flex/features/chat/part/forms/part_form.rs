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

use flex_chat::channel::validate_channels;
use flex_chat::macros::command_formdata;
use flex_chat::user::validate_nicknames;

command_formdata! {
	struct PART
	{
		/// Salons à quitter.
		#[serde(deserialize_with = "validate_channels")]
		channels: Vec<Arc<str>>,
		/// Message part du client.
		message: Option<Arc<str>>,
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
		channels: Vec<Arc<str>>,
		/// Message part du client.
		message: Option<Arc<str>>,
	}
}
