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

use crate::features::auth::forms::RegistrationFormData;
use crate::features::auth::responses::CreationAccountReply;
use crate::features::auth::routes::web::AuthRouteID;
use crate::features::auth::services::{AuthService, AuthenticationService};
use crate::features::auth::views::SignupView;
use crate::features::users::dto::UserNewActionDTO;
use crate::features::users::repositories::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
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
	#[rustfmt::skip]
	pub async fn handle(
		ctx: HttpContext<Self>,
		Form(form): Form<RegistrationFormData>,
	) -> impl IntoResponse
	{
		let user_new = UserNewActionDTO::from(form);
		if let Err(err) = ctx.auth_service.signup(user_new).await {
			tracing::error!(?err, "Erreur lors de l'inscription");
		}

		if ctx.request.accept().json() {
			ctx.response.json(CreationAccountReply.json()).into_response()
		} else {
			ctx.session.flash(CreationAccountReply::KEY, CreationAccountReply).await;
			ctx.response.redirect_to(AuthRouteID::Login).into_response()
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for SignupController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;
		let password_service = ext.get::<Argon2Password>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let user_repository = UserRepositoryPostgreSQL {
			query_builder,
		};

		let auth_service = AuthService {
			user_repository: user_repository.shared(),
			password_service: password_service.clone(),
		};

		Some(Self {
			auth_service: auth_service.shared(),
		})
	}
}

unsafe impl Send for SignupController {}
unsafe impl Sync for SignupController {}
