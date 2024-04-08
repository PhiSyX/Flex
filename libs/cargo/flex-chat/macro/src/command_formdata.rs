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

$crate::paste::paste! { $(

	#[derive(Debug)]
	#[derive(serde::Serialize, serde::Deserialize)]
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
