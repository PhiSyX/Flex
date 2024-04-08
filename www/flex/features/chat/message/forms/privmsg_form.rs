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
use flex_chat::user::{do_nickname_with_config, DoNicknameFnOptions, NICK_MAX_SIZE};
use flex_serde_validation::array::validate_vec_string_filter;
use flex_serde_validation::string::validate_string_filter;

command_formdata! {
	struct PRIVMSG
	{
		/// Le paramètre `<target>` est généralement le surnom du destinataire
		/// du message, ou un nom de salon.
		///
		/// Le paramètre `<target>` PEUT également être un masque d'hôte
		/// (#<mask>) ou un masque de serveur ($<mask>). Dans les deux cas, le
		/// serveur n'enverra le PRIVMSG qu'aux personnes dont le serveur ou
		/// l'hôte correspond au masque. Le masque DOIT contenir au moins 1 (un)
		/// "." et aucun caractère de remplacement ne doit suivre le dernier
		/// ".". Cette exigence a pour but d'empêcher les personnes d'envoyer
		/// des messages à "#*" ou "$*", qui seraient diffusés à tous les
		/// clients. Les caractères génériques sont les caractères "*" et "?".
		/// Cette extension de la commande PRIVMSG n'est disponible que pour les
		/// opérateurs.
		#[serde(deserialize_with = "validate_targets")]
		targets: Vec<String>,
		/// Le message envoyé.
		#[serde(deserialize_with = "validate_string_filter")]
		text: Arc<str>,
	}
}

/// Valide la valeur utilisateur: filtre une valeur de type String.
pub fn validate_targets<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	let v = validate_vec_string_filter(deserializer)?;

	Ok(v.iter()
		.filter_map(|s| {
			if s.starts_with('#') {
				return Some(s.to_owned());
			}

			do_nickname_with_config(
				s,
				DoNicknameFnOptions {
					max_size: NICK_MAX_SIZE,
					reserved_list: vec![String::from("flex")],
				},
			)
			.map(|s| s.to_string())
			.ok()
		})
		.collect())
}
