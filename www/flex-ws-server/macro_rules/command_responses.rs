// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

#[macro_export]
macro_rules! command_response {
	($(
		$(#[$doc_struct:meta])*
		struct $command:ident $(<$generic:ident>)? $({
			$(
				$(#[$doc_field:meta])*
				$field:ident : $ty:ty,
			)*
		})?
	)*) => {
// --------- //
// Structure //
// --------- //

::paste::paste! { $(

	#[derive(Clone)]
	#[derive(serde::Serialize)]
	$(#[$doc_struct])*
	pub struct [ < $command:camel CommandResponse > ] <'a $(, $generic)?, U = $crate::src::chat::components::user::User>
	{
		#[serde(skip_serializing_if = "Option::is_none")]
		pub origin: Option<&'a U>,
		pub tags: std::collections::HashMap<String, String>,
		$($(
			$(#[$doc_field])*
			pub $field : $ty
		),*)?
	}

)* }

// -------------- //
// Implémentation //
// -------------- //

::paste::paste! { $(

	impl<'a $(, $generic)?> [ < $command:camel CommandResponse > ] <'a $(, $generic)?>
	{
		pub fn default_tags() -> std::collections::HashMap<String, String>
		{
			return [("msgid", flex_web_framework::types::uuid::Uuid::new_v4())]
				.into_iter()
				.map(|(k, v)| (k.to_string(), v.to_string()))
				.collect()
		}
	}

	impl<'a $(, $generic)?, U> [ < $command:camel CommandResponse > ] <'a $(, $generic)?, U>
	{
		#[allow(dead_code)]
		pub fn with_tags<K, V>(
			mut self,
			tags: impl IntoIterator<Item = ( K, V )>
		) -> Self
		where
			K: ToString,
			V: ToString,
		{
			let tags = tags
				.into_iter()
				.map(|(k, v)| (k.to_string(), v.to_string()));
			self.tags.extend(tags);
			self
		}
	}

	impl<'a $(, $generic)?, U> [ < $command:camel CommandResponse > ] <'a $(, $generic)?, U>
	{
		pub const fn name(&self) -> &'static str { stringify!($command) }
	}

)* }
	}
}
