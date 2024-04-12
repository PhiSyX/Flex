// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::uuid;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct CreationAccountReply;

// -------------- //
// Implémentation //
// -------------- //

impl CreationAccountReply
{
	pub const KEY: &'static str = "CREATION_ACCOUNT";

	pub fn json(&self) -> serde_json::Value
	{
		serde_json::json!({
			"id": uuid::Uuid::new_v4(),
			"code": Self::KEY,
			"message": self.to_string()
		})
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl std::fmt::Display for CreationAccountReply
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(
			f,
			"Un lien d'activation de votre compte a été envoyé par courriel à \
			 l'adresse fournie."
		)
	}
}
