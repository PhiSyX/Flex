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

use flex_chat::macros::command_formdata;
use flex_chat::user::validate_nickname;
use flex_serde_validation::string::validate_string_filter;

command_formdata! {
	struct USER
	{
		/// Identifiant du client.
		#[serde(deserialize_with = "validate_nickname")]
		user: String,

		/// Le paramètre `<mode>` doit être un numérique, et peut être utilisé
		/// pour définir automatiquement les modes utilisateur lors de
		/// l'enregistrement avec le serveur. Ce paramètre est un masque de
		/// bits, avec seulement 2 bits ayant une signification : si le bit 2
		/// est défini, le mode utilisateur 'w' sera défini et si le bit 3 est
		/// défini, le mode utilisateur 'i' sera défini.
		mode: u8,

		/// Le `<realname>` peut contenir des caractères d'espacement.
		#[serde(deserialize_with = "validate_string_filter")]
		realname: Arc<str>,
	}
}
