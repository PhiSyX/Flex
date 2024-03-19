// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::request::Request;
use flex_web_framework::http::response::Redirect;
use flex_web_framework::http::{IntoResponse, Response};
use flex_web_framework::middleware::Next;
use flex_web_framework::sessions::Session;

use crate::features::auth::dto::user_cookie_dto::UserCookieDTO;
use crate::features::auth::sessions::constants::USER_SESSION;

// --------- //
// Structure //
// --------- //

pub struct GuestMiddleware;

// -------------- //
// Implémentation //
// -------------- //

impl GuestMiddleware
{
	// TODO: remplacer vers une enum route id
	const REDIRECT_TO: &'static str = "/chat";

	pub async fn handle(session: Session, req: Request, next: Next) -> Response
	{
		match session.get::<UserCookieDTO>(USER_SESSION).await {
			| Ok(Some(_)) => Redirect::to(Self::REDIRECT_TO).into_response(),
			| _ => next.run(req).await,
		}
	}
}
