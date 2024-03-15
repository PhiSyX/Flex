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
		struct $command:ident $(<$($generic:tt),*>)? $({
			$(
				$(#[$doc_field:meta])*
				$field:ident : $ty:ty,
			)*
		})?
	)*) => {
// --------- //
// Structure //
// --------- //

$crate::paste::paste! { $(

	#[derive(Debug)]
	#[derive(Clone)]
	#[derive(serde::Serialize)]
	$(#[$doc_struct])*
	pub struct [ < $command:camel CommandResponse > ] <'o, $($($generic,)*)? O = ()>
	{
		pub origin: &'o O,
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

$crate::paste::paste! { $(

	impl<'o, $($($generic,)*)?> [ < $command:camel CommandResponse > ] <'o, $($($generic,)*)?>
	{
		pub fn default_tags() -> std::collections::HashMap<String, String>
		{
			return [("msgid", $crate::Uuid::new_v4())]
				.into_iter()
				.map(|(k, v)| (k.to_string(), v.to_string()))
				.collect()
		}
	}

	impl<'o, $($($generic,)*)? O> [ < $command:camel CommandResponse > ] <'o, $($($generic,)*)? O>
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

	impl<'o, $($($generic,)*)? O> [ < $command:camel CommandResponse > ] <'o, $($($generic,)*)? O>
	{
		pub const fn name(&self) -> &'static str { stringify!($command) }
	}

)* }
	}
}
