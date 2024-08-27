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
	Extensions,
	HttpContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::{
	DatabaseService,
	PostgreSQLDatabase,
	SessionFlashExtension,
};

use crate::features::auth::errors::LoginError;
use crate::features::auth::forms::LoginFormData;
use crate::features::auth::services::{AuthService, AuthenticationService};
use crate::features::auth::views::LoginView;
use crate::features::chat::routes::ChatRouteID;
use crate::features::users::repositories::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::users::sessions::constant::USER_SESSION;
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
		http.response.render(LoginView::default()).await
	}

	/// Traitement du formulaire de connexion.
	pub async fn handle(
		http: HttpContext<Self>,
		Form(formdata): Form<LoginFormData>,
	) -> Result<impl IntoResponse, HttpContextError<Self>>
	{
		let Ok(user) = http
			.auth_service
			.attempt(&formdata.identifier, &formdata.password)
			.await
		else {
			if http.request.accept().json() {
				return Err(HttpContextError::unauthorized_with_reason(
					http.request,
					LoginError::InvalidCredentials,
				));
			} else {
				http.session
					.flash(LoginError::KEY, LoginError::InvalidCredentials)
					.await;
				return Ok(http.redirect_back().into_response());
			}
		};

		http.cookies
			.signed()
			.add((Self::COOKIE_NAME, user.id.to_string()));
		_ = http.session.insert(USER_SESSION, &user).await;

		if http.request.accept().json() {
			Ok(http.response.json(user).into_response())
		} else {
			Ok(http.response.redirect_to(ChatRouteID::Home).into_response())
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for LoginController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;
		let password_service = ext.get::<Argon2Password>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let user_repository = UserRepositoryPostgreSQL { query_builder };

		let auth_service = AuthService {
			user_repository: user_repository.shared(),
			password_service: password_service.clone(),
		};

		Some(Self {
			auth_service: auth_service.shared(),
		})
	}
}

unsafe impl Send for LoginController {}
unsafe impl Sync for LoginController {}
