// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::request::State;
use flex_web_framework::http::response::Html;
use flex_web_framework::http::{Extensions, HttpContext, HttpContextInterface};
use flex_web_framework::ServerSettings;

use crate::features::chat::home::HomeView;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct HomeController;

// -------------- //
// Implémentation //
// -------------- //

impl HomeController
{
	pub async fn view(
		http: HttpContext<Self>,
		State(server_settings): State<ServerSettings>,
	) -> Html<HomeView>
	{
		let mut vite_url = server_settings.http_url();
		_ = vite_url.set_port(Some(5173));
		http.response.html(HomeView { vite_url })
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for HomeController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self {})
	}
}
