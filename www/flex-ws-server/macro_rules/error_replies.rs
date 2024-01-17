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
macro_rules! error_replies {
	(
		$(
			$(#[$attr:meta])*
			| $code:tt <-> $numeric:ident $({ $(
				$(#[$attr_field:meta])*
				$field:ident : $ty:ty
			),* })?
					=> $str:literal
			)*
	) => {
// --------- //
// Structure //
// --------- //

::paste::paste! { $(

	#[derive(Clone)]
	$(#[$attr])*
	pub struct [ < $numeric:camel Error > ] <'a, U = $crate::src::chat::components::user::User>
	{
		pub origin: Option<&'a U>,
		pub tags: std::collections::HashMap<String, String>,
		$($(
			$(#[$attr_field])*
			pub $field : &'a str
		),*)?
	}

)* }


// -------------- //
// Implémentation //
// -------------- //

::paste::paste! { $(

	impl<'a> [ < $numeric:camel Error > ] <'a>
	{
		pub fn default_tags() -> std::collections::HashMap<String, String>
		{
			return [("msgid", flex_web_framework::types::uuid::Uuid::new_v4())]
				.into_iter()
				.map(|(k, v)| (k.to_string(), v.to_string()))
				.collect()
		}
	}

	impl<'a, U> [ < $numeric:camel Error > ] <'a,  U>
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

	impl<'a> [ < $numeric:camel Error > ] <'a>
	{
		pub fn fields(&'a self) -> &[&'static str]
		{
			&[
				$($(
					stringify!($field)
				),*)?
			]
		}

		#[allow(clippy::zero_prefixed_literal)]
		pub const fn code(&self) -> u16 { $code }
		pub const fn name(&self) -> &'static str { stringify!($numeric) }
	}

)* }

// -------------- //
// Implémentation // -> Interface
// -------------- //

::paste::paste! { $(

impl<'a> std::fmt::Display for [ < $numeric:camel Error > ] <'a>
{
	#[allow(unused_variables)]
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		$($(
			let $field = self . $field ;
		)*)?

		let message = format!($str);

		write!(f, "{}", message)
	}
}

impl<'a> serde::Serialize for [ < $numeric:camel Error > ] <'a>
{
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer,
	{
		use serde::ser::SerializeStruct;
		let fields = self.fields();
		let maybe_origin = self.origin.is_some() as usize;
		let mut serde_struct = S::serialize_struct(
			serializer,
			stringify!([ < $numeric:camel Error > ]),
			4 + fields.len() + maybe_origin
		)?;
		$($(
			serde_struct.serialize_field(stringify!($field), self . $field)?;
		)*)?
		if let Some(origin) = self.origin {
			serde_struct.serialize_field("origin", &origin)?;
		}
		serde_struct.serialize_field("tags", &self.tags)?;
		serde_struct.serialize_field("name", self.name())?;
		serde_struct.serialize_field("code", &self.code())?;
		serde_struct.serialize_field("reason", &self.to_string())?;
		serde_struct.end()
	}
}

)* }

	};
}
