// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashMap;

#[cfg(not(debug_assertions))]
use flex_web_framework::EmptyHTMLLayout;
use flex_web_framework::{types::url, vite, Node, ViewInterface, ViteLayout};

// --------- //
// Structure //
// --------- //

#[derive(flex_web_framework::View)]
pub struct HomeView
{
	pub vite_url: url::Url,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ViewInterface for HomeView
{
	#[cfg(not(debug_assertions))]
	type Layout = EmptyHTMLLayout;
	#[cfg(debug_assertions)]
	type Layout = ViteLayout;
	type Metadata = Node;
	type Scripts = Node;
	type Styles = Node;
	type View = Node;

	#[cfg(debug_assertions)]
	fn data(&self) -> std::collections::HashMap<String, String>
	{
		let vite_url = self.vite_url.to_string();
		HashMap::from([
			("vite_url".into(), vite_url.trim_end_matches('/').to_owned()),
			("vite_root".into(), "🆔".into()),
		])
	}

	fn title(&self) -> impl ToString
	{
		"Flex"
	}

	fn view(&self) -> Self::View
	{
		if cfg!(debug_assertions) {
			// TODO: À améliorer
			if self.vite_url.scheme().starts_with("https") {
				vite!("https://localhost:5173#🆔")
			} else {
				vite!("http://localhost:5173#🆔")
			}
		} else {
			vite!("apps/flex-chat-webapp")
		}
	}
}
