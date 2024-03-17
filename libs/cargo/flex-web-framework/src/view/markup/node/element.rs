// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt;

use super::{with_children, Node};

// --------- //
// Structure //
// --------- //

pub struct ElementNode
{
	pub tag_name: String,
	pub attributes: Vec<(String, Option<String>)>,
	pub children: Option<Vec<Node>>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl fmt::Display for ElementNode
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(f, "<{}", self.tag_name)?;

		for (key, value) in &self.attributes {
			write!(f, " {key}")?;

			if let Some(value) = value.as_deref() {
				let html_special_chars = html_escape::encode_double_quoted_attribute(value);
				write!(f, r#"="{html_special_chars}""#)?;
			}
		}

		write!(f, ">")?;

		if let Some(children) = self.children.as_deref() {
			with_children(f, children, false)?;
			write!(f, "</{}>", self.tag_name)?;
		}

		Ok(())
	}
}

impl<N> From<N> for ElementNode
where
	N: Into<String>,
{
	fn from(tag_name: N) -> Self
	{
		Self {
			tag_name: tag_name.into(),
			attributes: Vec::new(),
			children: None,
		}
	}
}
