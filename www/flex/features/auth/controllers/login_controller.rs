// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use flex_web_framework::extract::Form;
use flex_web_framework::http::response::Html;
use flex_web_framework::http::{
	Cookies,
	Extensions,
	HttpContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::sessions::Session;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase, SessionFlashExtension};

use crate::features::auth::dto::user_cookie_dto::UserCookieDTO;
use crate::features::auth::errors::login_error::LoginError;
use crate::features::auth::forms::login_form::LoginFormData;
use crate::features::auth::repositories::user_repository::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::auth::services::auth_service::{AuthService, AuthenticationService};
use crate::features::auth::sessions::constants::USER_SESSION;
use crate::features::auth::views::login_view::LoginView;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct LoginController
{
	auth_service: Arc<dyn AuthenticationService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl LoginController
{
	pub const COOKIE_NAME: &'static str = "flex.auth_user";

	/// Page de connexion au site.
	pub async fn view(http: HttpContext<Self>) -> Html<LoginView>
	{
		match http.session.take::<LoginError>("error").await {
			| Some(error) => http.response.html(LoginView::default().with_error(error)),
			| None => http.response.html(LoginView::default()),
		}
	}

	/// Traitement du formulaire de connexion.
	pub async fn handle(
		ctx: HttpContext<Self>,
		Form(formdata): Form<LoginFormData>,
	) -> impl IntoResponse
	{
		let Ok(user) = ctx
			.auth_service
			.attempt(&formdata.identifier, &formdata.password)
			.await
		else {
			ctx.session
				.flash("error", LoginError::InvalidCredentials)
				.await;
			return ctx.redirect_back();
		};

		ctx.cookies
			.signed()
			.add((Self::COOKIE_NAME, user.id.to_string()));

		_ = ctx
			.session
			.insert(USER_SESSION, UserCookieDTO::from(user))
			.await;

		ctx.response.redirect_to("/chat")
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl HttpContextInterface for LoginController
{
	type State = FlexState;

	fn constructor(extensions: &Extensions, _: Self::State) -> Result<Self, HttpContextError>
	{
		let db_service = extensions
			.get::<DatabaseService<PostgreSQLDatabase>>()
			.ok_or(HttpContextError::MissingExtension)?;
		let password_service = extensions
			.get::<Argon2Password>()
			.ok_or(HttpContextError::MissingExtension)?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let auth_service = AuthService {
			user_repository: UserRepositoryPostgreSQL { query_builder }.shared(),
			password_service: password_service.clone(),
		}
		.shared();

		Ok(Self { auth_service })
	}
}

unsafe impl Send for LoginController {}
unsafe impl Sync for LoginController {}
