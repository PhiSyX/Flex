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
use flex_chat::user::validate_nicknames;

command_formdata! {
	struct AccessLevelAdminOperator
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		channel: Arc<str>,
		/// Les pseudonymes à élever au rang d'opérateur admin.
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
	}
}

command_formdata! {
	struct AccessLevelHalfOperator
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		channel: Arc<str>,
		/// Les pseudonymes à élever au rang de demi opérateur.
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
	}
}

command_formdata! {
	struct AccessLevelOperator
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		channel: Arc<str>,
		/// Les pseudonymes à élever au rang d'opérateur.
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
	}
}

command_formdata! {
	struct AccessLevelOwnerOperator
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		channel: Arc<str>,
		/// Les pseudonymes à élever au rang d'opérateur "owner".
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
	}
}

command_formdata! {
	struct AccessLevelVip
	{
		/// Le salon.
		#[serde(deserialize_with = "validate_channel")]
		channel: Arc<str>,
		/// Les pseudonymes à élever au rang de VIP.
		#[serde(deserialize_with = "validate_nicknames")]
		nicknames: Vec<String>,
	}
}
