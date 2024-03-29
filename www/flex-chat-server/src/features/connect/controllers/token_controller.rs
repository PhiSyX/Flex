// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::extract::Form;
use flex_web_framework::http::{IntoResponse, StatusCode};
use flex_web_framework::types::time;

use crate::src::features::connect::TokenFormData;

// --------- //
// Structure //
// --------- //

pub struct TokenController;

// -------------- //
// Implémentation //
// -------------- //

impl TokenController
{
	pub const COOKIE_TOKEN_KEY: &'static str = "flex.token";

	pub async fn token(
		cookie_manager: flex_web_framework::http::Cookies,
		Form(token_form_data): Form<TokenFormData>,
	) -> impl IntoResponse
	{
		tracing::debug!(?token_form_data, "Données du formulaire");

		let signed_cookies = cookie_manager.signed();
		signed_cookies.add((
			Self::COOKIE_TOKEN_KEY,
			token_form_data.token.to_string(),
			time::Duration::days(3),
		));

		StatusCode::OK
	}
}
