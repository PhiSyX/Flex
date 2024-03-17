// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use core::fmt;

// --------- //
// Structure //
// --------- //

pub struct TextNode
{
	pub text: String,
}

pub struct JsonTextNode
{
	pub text: String,
}

pub struct DangerousTextNode
{
	pub raw_text: String,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl fmt::Display for TextNode
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let html_special_chars = html_escape::encode_safe(&self.text);
		write!(f, "{}", html_special_chars)
	}
}

impl fmt::Display for JsonTextNode
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let html_special_chars = html_escape::encode_script(&self.text);
		write!(f, "{}", html_special_chars)
	}
}

impl fmt::Display for DangerousTextNode
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(f, "{}", self.raw_text)
	}
}

impl<T> From<T> for TextNode
where
	T: Into<String>,
{
	fn from(text: T) -> Self
	{
		Self { text: text.into() }
	}
}

impl<T> From<T> for DangerousTextNode
where
	T: Into<String>,
{
	fn from(text: T) -> Self
	{
		Self {
			raw_text: text.into(),
		}
	}
}
