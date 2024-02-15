// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Structure //
// --------- //

use flex_web_framework::extract::Form;
use flex_web_framework::http::request::State;
use flex_web_framework::http::{IntoResponse, StatusCode};
use flex_web_framework::types::time;

use super::TokenFormData;

pub struct ConnectController;

// -------------- //
// Implémentation //
// -------------- //

impl ConnectController
{
	pub async fn token(
		cm: flex_web_framework::http::TowerCookies,
		State(cookie_key): State<flex_web_framework::http::Key>,
		Form(token_form_data): Form<TokenFormData>,
	) -> impl IntoResponse
	{
		tracing::debug!(?token_form_data, "Données du formulaire");

		let cookie_manager = flex_web_framework::http::Cookies::new(&cm, &cookie_key);
		let signed_cookies = cookie_manager.signed();

		let session_token = token_form_data.token;
		let new_token_cookie = flex_web_framework::http::Cookie::build(("token", session_token))
			.path("/")
			.expires(time::OffsetDateTime::now_utc().checked_add(time::Duration::days(3)))
			.secure(true)
			.http_only(true);

		signed_cookies.add(new_token_cookie.build());

		StatusCode::OK
	}
}
