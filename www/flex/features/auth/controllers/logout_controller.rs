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
	Extensions,
	HttpAuthContext,
	HttpContext,
	HttpContextInterface,
	IntoResponse,
};

use crate::FlexState;
use crate::features::auth::routes::web::AuthRouteID;
use crate::features::auth::views::LogoutView;
use crate::features::chat::connect::TokenController;
use crate::features::users::dto::UserSessionDTO;
use crate::features::users::sessions::constant::USER_SESSION;

// --------- //
// Structure //
// --------- //

pub struct LogoutController {}

// -------------- //
// Implémentation //
// -------------- //

impl LogoutController
{
	pub const COOKIE_NAME: &'static str = "flex.auth_user";

	/// Page de déconnexion.
	pub async fn view(
		ctx: HttpAuthContext<Self, UserSessionDTO>,
	) -> impl IntoResponse
	{
		ctx.response
			.render(LogoutView {
				user_session: ctx.user,
			})
			.await
	}

	/// Déconnexion de l'utilisateur en session.
	pub async fn handle(ctx: HttpContext<Self>) -> impl IntoResponse
	{
		ctx.cookies.signed().remove(Self::COOKIE_NAME);
		ctx.cookies.signed().remove(TokenController::COOKIE_TOKEN_KEY);
		_ = ctx.session.remove::<()>(USER_SESSION).await;
		ctx.response.redirect_to(AuthRouteID::Login)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for LogoutController
{
	type State = FlexState;

	fn constructor(_: &Extensions, _: Self::State) -> Option<Self>
	{
		Some(Self {})
	}
}

unsafe impl Send for LogoutController {}
unsafe impl Sync for LogoutController {}
