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

use crate::features::auth::dto::UserCookieDTO;
use crate::features::auth::routes::web::AuthRouteID;
use crate::features::auth::sessions::constants::USER_SESSION;

// --------- //
// Structure //
// --------- //

pub struct AuthMiddleware;

// -------------- //
// Implémentation //
// -------------- //

impl AuthMiddleware
{
	pub const REDIRECT_TO: AuthRouteID = AuthRouteID::Login;

	/// Route accessible pour les admins uniquement.
	pub async fn admin_only(session: Session, req: Request, next: Next) -> Response
	{
		match session.get::<UserCookieDTO>(USER_SESSION).await {
			| Ok(Some(user)) if user.role.is_admin() => next.run(req).await,
			| _ => Redirect::to(&Self::REDIRECT_TO.to_string()).into_response(),
		}
	}

	/// Route accessible pour les modérateurs (+ admins) uniquement.
	pub async fn moderator_only(session: Session, req: Request, next: Next) -> Response
	{
		match session.get::<UserCookieDTO>(USER_SESSION).await {
			| Ok(Some(user)) if user.role.is_moderator() || user.role.is_admin() => {
				next.run(req).await
			}
			| _ => Redirect::to(&Self::REDIRECT_TO.to_string()).into_response(),
		}
	}

	/// Route nécessitant l'authentification de l'utilisateur.
	pub async fn required(session: Session, req: Request, next: Next) -> Response
	{
		match session.get::<UserCookieDTO>(USER_SESSION).await {
			| Ok(Some(_)) => next.run(req).await,
			| _ => Redirect::to(&Self::REDIRECT_TO.to_string()).into_response(),
		}
	}
}
