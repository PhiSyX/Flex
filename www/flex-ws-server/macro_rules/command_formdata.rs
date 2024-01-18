// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// Cette macro génère une structure avec comme nom: $command + CommandFormData
// où $command est transformé en camelCase.
//
// Exemple pour le nom de commande "PASS" => "PassCommandFormData"
#[macro_export]
macro_rules! command_formdata {
	(
		$(
		$(#[$doc_struct:meta])*
		struct $command:ident {
			$(
				$(#[$doc_field:meta])*
				$field:ident : $ty:ty,
			)*
		}
		)*
	) => {
// --------- //
// Structure //
// --------- //

::paste::paste! { $(

	#[derive(Debug)]
	#[derive(serde::Deserialize, serde::Serialize)]
	$(#[$doc_struct])*
	pub struct [ <$command:camel CommandFormData> ]
	{
		$(
			$(#[$doc_field])*
			pub $field: $ty,
		)*
	}

)* }
	}
}

pub fn validate_channel<'de, D>(deserializer: D) -> Result<String, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let s = String::deserialize(deserializer)?;
	let c = s.trim();
	if c.is_empty() || c.len() > 30 || !c.starts_with('#') {
		return Err(serde::de::Error::custom(format!(
			"Le nom du salon « {s} » est incorrect"
		)));
	}

	Ok(c.to_owned())
}

pub fn validate_channels<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;
	let v = Vec::<String>::deserialize(deserializer)?;

	let chans = v
		.iter()
		.filter_map(|s| {
			let c = s.trim();
			(!c.is_empty() || c.len() <= 30 || c.starts_with('#')).then_some(c.to_owned())
		})
		.collect();

	Ok(chans)
}

pub fn validate_nickname<'de, D>(deserializer: D) -> Result<String, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;

	let s = String::deserialize(deserializer)?;

	match crate::src::chat::components::user::do_nickname_with_config(
		&s,
		crate::src::chat::components::user::DoNicknameFnOptions {
			max_size: crate::src::chat::components::user::NICK_MAX_SIZE,
			reserved_list: vec![String::from("flex")],
		},
	) {
		| Ok(s) => Ok(s.to_owned()),
		| Err(_) => {
			Err(serde::de::Error::custom(format!(
				"Le nom « {s} » est incorrect"
			)))
		}
	}
}

pub fn validate_nicknames<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
	D: serde::Deserializer<'de>,
{
	use serde::Deserialize;

	let v = Vec::<String>::deserialize(deserializer)?;

	let nicks = v
		.iter()
		.filter_map(|n| {
			crate::src::chat::components::user::do_nickname(n)
				.map(Into::into)
				.ok()
		})
		.collect();

	Ok(nicks)
}
