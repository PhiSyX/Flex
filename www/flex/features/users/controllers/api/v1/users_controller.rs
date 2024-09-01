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

use flex_web_framework::http::request::{Path, Query};
use flex_web_framework::http::{
	Extensions,
	HttpAuthContext,
	HttpContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::types::uuid::Uuid;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::users::dto::{UserInfoDTO, UserSessionDTO};
use crate::features::users::entities::UserAccountStatus;
use crate::features::users::repositories::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::users::services::UserService;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct UsersController
{
	user_service: Arc<UserService<PostgreSQLDatabase>>,
}

#[derive(serde::Deserialize)]
pub struct GetUserInfoQueryParams
{
	#[serde(default)]
	privacy: QueryParamsPrivacy,
}

#[derive(Default)]
#[derive(serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum QueryParamsPrivacy
{
	#[default]
	Public,
}

// -------------- //
// Implémentation //
// -------------- //

impl UsersController
{
	/// Récupère les informations d'un utilisateur.
	pub async fn get_user_info(
		http: HttpContext<Self>,
		Path(user_id): Path<Uuid>,
		Query(query): Query<GetUserInfoQueryParams>,
	) -> Result<impl IntoResponse, HttpContextError<Self>>
	{
		let privacy = match query.privacy {
			| QueryParamsPrivacy::Public => UserAccountStatus::Public,
		};

		let user_info = http
			.user_service
			.get_account(&user_id, privacy)
			.await
			.map(UserInfoDTO::from)
			.map_err(|err| HttpContextError::database(http.request, err))?;

		Ok(http.response.json(user_info))
	}

	/// Utilisateur connecté en session.
	pub async fn session(
		http: HttpAuthContext<Self, UserSessionDTO>,
	) -> impl IntoResponse
	{
		http.response.json(http.user)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for UsersController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let user_repository = UserRepositoryPostgreSQL {
			query_builder: query_builder.clone(),
		};

		let user_service = UserService {
			user_repository: user_repository.shared(),
		};
		Some(Self {
			user_service: user_service.shared(),
		})
	}
}

unsafe impl Send for UsersController {}
unsafe impl Sync for UsersController {}
