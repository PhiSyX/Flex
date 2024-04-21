// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::{fmt, ops};

use console::style;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Deserialize)]
pub struct Secret<S>(S);

// -------------- //
// Implémentation //
// -------------- //

impl<S> Secret<S>
{
	pub fn new(secret: S) -> Self
	{
		Self(secret)
	}

	pub fn set(&mut self, secret: S)
	{
		self.0 = secret;
	}
}

impl<S> Secret<S>
{
	pub fn expose(&self) -> &S
	{
		&self.0
	}

	pub fn redacted(&self) -> &str
	{
		"*****"
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> fmt::Debug for Secret<S>
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(
			f,
			"[{}] ({})",
			style("redacted").red(),
			style(std::any::type_name::<S>()).italic().black().bright()
		)
	}
}

impl<S> fmt::Display for Secret<S>
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(f, "{}", self.redacted())
	}
}

impl<S> ops::Deref for Secret<S>
{
	type Target = S;

	fn deref(&self) -> &Self::Target
	{
		&self.0
	}
}

impl<S> From<S> for Secret<S>
{
	fn from(secret: S) -> Self
	{
		Self(secret)
	}
}

impl<S> From<&S> for Secret<S>
where
	S: ToOwned<Owned = S>,
{
	fn from(secret: &S) -> Self
	{
		Self(secret.to_owned())
	}
}

impl<S> PartialEq<S> for Secret<S>
where
	S: PartialEq,
{
	fn eq(&self, other: &S) -> bool
	{
		other == &self.0
	}
}

impl<S> PartialEq<&S> for Secret<S>
where
	S: PartialEq,
{
	fn eq(&self, other: &&S) -> bool
	{
		other == &&self.0
	}
}

impl<T> serde::Serialize for Secret<T>
{
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer,
	{
		let serde_str = S::serialize_str(serializer, self.redacted());
		serde_str
	}
}

impl<S> Default for Secret<S>
where
	S: Default
{
	fn default() -> Self
	{
		Self(Default::default())
	}
}
