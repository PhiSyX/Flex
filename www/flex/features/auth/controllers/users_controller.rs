// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::{
	header,
	Extensions,
	HeaderMap,
	HeaderValue,
	HttpContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
	StatusCode,
};
use flex_web_framework::RouteIDInterface;
use serde_json::json;

use crate::features::auth::dto::user_cookie_dto::UserCookieDTO;
use crate::features::auth::routes::api::AuthApi_V1_RouteID;
use crate::features::auth::sessions::constants::USER_SESSION;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct UsersController {}

// -------------- //
// Implémentation //
// -------------- //

impl UsersController
{
	/// Utilisateur connecté en session.
	pub async fn current_user(http: HttpContext<Self>) -> impl IntoResponse
	{
		let Ok(Some(current_user)) = http.session.get::<UserCookieDTO>(USER_SESSION).await else {
			let mut headers = HeaderMap::new();

			headers.insert(
				header::CONTENT_TYPE,
				HeaderValue::from_str("application/problem+json").unwrap(),
			);

			return (
				StatusCode::UNAUTHORIZED,
				headers,
				// FIXME: ajouter plus de détails?
				http.response.json(json!({
					"title": "Non autorisé à consulter cette ressource",
					"status": StatusCode::UNAUTHORIZED.as_u16(),
					"detail": "Pour des raisons de confidentialité, vous n'êtes pas autorisé à consulter les détails de cette ressource. Seuls les utilisateurs connectés sont autorisés à le faire.",
					"instance": http.request.uri.path(),
				}))
			).into_response();
		};

		http.response.json(current_user).into_response()
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl HttpContextInterface for UsersController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Result<Self, HttpContextError>
	{
		Ok(Self {})
	}
}

unsafe impl Send for UsersController {}
unsafe impl Sync for UsersController {}
