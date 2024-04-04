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
use flex_web_framework::http::{Extensions, HttpContext, HttpContextError, HttpContextInterface, IntoResponse};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::auth::forms::LoginFormData;
use crate::features::auth::services::{AuthService, AuthenticationService};
use crate::features::users::sessions::constant::USER_SESSION;
use crate::features::users::dto::UserSessionDTO;
use crate::features::users::repositories::{UserRepository, UserRepositoryPostgreSQL};
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct IdentifyController
{
	auth_service: Arc<dyn AuthenticationService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl IdentifyController
{
	pub const COOKIE_NAME: &'static str = "flex.auth_user";

	/// Traitement du formulaire de connexion.
	pub async fn handle(ctx: HttpContext<Self>, Form(formdata): Form<LoginFormData>)
		-> Result<impl IntoResponse, HttpContextError<Self>>
	{
		let Ok(user) = ctx.auth_service.attempt(&formdata.identifier, &formdata.password).await else {
			return Err(HttpContextError::Unauthorized { request: ctx.request });
		};
		ctx.cookies.signed().add((Self::COOKIE_NAME, user.id.to_string()));
		_ = ctx.session.insert(USER_SESSION, UserSessionDTO::from(user)).await;
		let user_session: UserSessionDTO = ctx.session.get(USER_SESSION).await?.unwrap();
		Ok(ctx.response.json(user_session))
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for IdentifyController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;
		let password_service = ext.get::<Argon2Password>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let auth_service = AuthService {
			user_repository: UserRepositoryPostgreSQL { query_builder }.shared(),
			password_service: password_service.clone(),
		}
		.shared();

		Some(Self { auth_service })
	}
}

unsafe impl Send for IdentifyController {}
unsafe impl Sync for IdentifyController {}
