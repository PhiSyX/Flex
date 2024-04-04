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
use flex_web_framework::http::{Extensions, HttpContext, HttpContextInterface, IntoResponse};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::types::uuid;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};
use serde_json::json;

use crate::features::auth::forms::RegistrationFormData;
use crate::features::auth::responses::CreatedAccountReply;
use crate::features::auth::services::{AuthService, AuthenticationService};
use crate::features::users::dto::UserNewActionDTO;
use crate::features::users::repositories::{UserRepository, UserRepositoryPostgreSQL};
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct RegisterController
{
	auth_service: Arc<dyn AuthenticationService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl RegisterController
{
	/// Inscription au site via l'API.
	pub async fn handle(ctx: HttpContext<Self>, Form(form): Form<RegistrationFormData>)
		-> impl IntoResponse
	{
		if let Err(err) = ctx.auth_service.signup(UserNewActionDTO::from(form)).await {
			tracing::error!(?err, "Erreur lors de l'inscription");
		}

		ctx.response.json(json!({
			"id": uuid::Uuid::new_v4(),
			"code": CreatedAccountReply::KEY,
			"message": CreatedAccountReply.to_string()
		}))
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for RegisterController
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

unsafe impl Send for RegisterController {}
unsafe impl Sync for RegisterController {}
