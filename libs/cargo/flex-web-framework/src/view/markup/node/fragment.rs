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

use super::{Node, with_children};

// --------- //
// Structure //
// --------- //

pub struct FragmentNode
{
	pub children: Vec<Node>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl fmt::Display for FragmentNode
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		with_children(f, &self.children, true)
	}
}

impl<FN> FromIterator<FN> for FragmentNode
where
	FN: Into<Node>,
{
	fn from_iter<I>(iter: I) -> Self
	where
		I: IntoIterator<Item = FN>,
	{
		Self {
			children: iter.into_iter().map(Into::into).collect(),
		}
	}
}

impl<It, FN> From<It> for FragmentNode
where
	It: IntoIterator<Item = FN>,
	FN: Into<Node>,
{
	fn from(iter: It) -> Self
	{
		Self::from_iter(iter)
	}
}
