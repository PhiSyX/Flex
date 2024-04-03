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
use flex_web_framework::http::{
	Extensions,
	HttpContext,
	HttpContextInterface,
	IntoResponse,
	StatusCode,
};
use flex_web_framework::types::time;

use crate::features::chat::connect::forms::TokenFormData;
use crate::FlexState;

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
		http: HttpContext<Self>,
		Form(token_form_data): Form<TokenFormData>,
	) -> impl IntoResponse
	{
		tracing::debug!(?token_form_data, "Données du formulaire");

		http.cookies.signed().add((
			Self::COOKIE_TOKEN_KEY,
			token_form_data.token.to_string(),
			time::Duration::days(3),
		));

		StatusCode::OK
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for TokenController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self)
	}
}
