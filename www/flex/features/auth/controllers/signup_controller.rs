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
use flex_web_framework::http::response::{Html, Redirect};
use flex_web_framework::http::{Extensions, HttpContext, HttpContextError, HttpContextInterface};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase, SessionFlashExtension};

use crate::features::auth::forms::signup_form::RegistrationFormData;
use crate::features::auth::repositories::user_repository::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::auth::responses::rpl_created_account::CreatedAccountReply;
use crate::features::auth::routes::web::AuthRouteID;
use crate::features::auth::services::auth_service::{AuthService, AuthenticationService, NewUser};
use crate::features::auth::views::signup_view::SignupView;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct SignupController
{
	auth_service: Arc<dyn AuthenticationService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl SignupController
{
	/// Page d'inscription au site.
	pub async fn view(this: HttpContext<Self>) -> Html<SignupView>
	{
		this.response.render(SignupView::default()).await
	}

	/// Gestion du formulaire d'inscription au site.
	pub async fn handle(ctx: HttpContext<Self>, Form(form): Form<RegistrationFormData>)
		-> Redirect
	{
		if let Err(err) = ctx.auth_service.signup(NewUser::from(form)).await {
			tracing::error!(?err, "Erreur lors de l'inscription");
		}
		ctx.session
			.flash(CreatedAccountReply::KEY, CreatedAccountReply)
			.await;
		ctx.response.redirect_to(AuthRouteID::Login)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl HttpContextInterface for SignupController
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

unsafe impl Send for SignupController {}
unsafe impl Sync for SignupController {}
