// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework_macro::html;

use crate::{Node, ViewLayoutInterface};

// --------- //
// Structure //
// --------- //

/// Mise en page HTML vide.
pub struct EmptyHTMLLayout
{
	body: Node,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewLayoutInterface for EmptyHTMLLayout
{
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	fn new() -> Self
	where
		Self: Sized,
	{
		Self {
			body: Default::default(),
		}
	}

	fn set_title(&mut self, _: impl ToString) {}

	fn set_body(&mut self, body: Self::View)
	{
		self.body = body;
	}

	fn set_data(&mut self, _: std::collections::HashMap<String, String>) {}

	fn add_meta(&mut self, _: Self::Metadata) {}

	fn add_script(&mut self, _: Self::Scripts) {}

	fn add_style(&mut self, _: Self::Styles) {}

	fn view(&self) -> Self::View
	{
		html! {
			{ unsafe &self.body }
		}
	}
}
