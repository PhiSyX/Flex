// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::response::Json;
use flex_web_framework::http::{Extensions, HttpContext, HttpContextInterface};

use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct HelloWorldApiController;

// --------- //
// Structure //
// --------- //

#[derive(serde::Serialize)]
pub struct HelloWorldApiResponse
{
	hello: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl HelloWorldApiController
{
	pub async fn handle_api(_: HttpContext<Self>) -> Json<HelloWorldApiResponse>
	{
		Json(HelloWorldApiResponse {
			hello: String::from("World"),
		})
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for HelloWorldApiController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self)
	}
}

unsafe impl Send for HelloWorldApiController {}
unsafe impl Sync for HelloWorldApiController {}
