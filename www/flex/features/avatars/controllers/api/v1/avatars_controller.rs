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

use flex_web_framework::extract::Multipart;
use flex_web_framework::http::request::{Path, Query};
use flex_web_framework::http::response::Json;
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

use crate::FlexState;
use crate::features::avatars::dto::UpdateAvatarDTO;
use crate::features::avatars::services::{AvatarErrorService, AvatarService};
use crate::features::users::dto::UserSessionDTO;
use crate::features::users::entities::UserAccountStatus;
use crate::features::users::repositories::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::users::services::UserService;
use crate::features::users::sessions::constant::USER_SESSION;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct AvatarsController
{
	avatar_service: Arc<AvatarService<PostgreSQLDatabase>>,
	user_service: Arc<UserService<PostgreSQLDatabase>>,
}

#[derive(serde::Deserialize)]
pub struct ShowQueryParams
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

impl AvatarsController
{
	const DEFAULT_AVATAR: &'static str = "/public/img/default-avatar.png";
	// ------ //
	// Erreur //
	// ------ //
	const ERROR_CONTENT_TYPE: &'static str =
		"L'image DOIT être au format JPEG, JPG ou PNG.";
	const ERROR_REQUIRED_IMAGE: &'static str = "Une image au format JPEG, JPG \
	                                            ou PNG et une clé `avatar` \
	                                            sont attendues.";

	pub async fn show(
		http: HttpContext<Self>,
		Path(user_id): Path<Uuid>,
		Query(query): Query<ShowQueryParams>,
	) -> Result<impl IntoResponse, HttpContextError<Self>>
	{
		#[rustfmt::skip]
		let fallback = || {
			Ok(http.response.redirect_temporary(Self::DEFAULT_AVATAR))
		};

		// NOTE: L'ID reçu correspond à l'ID de l'utilisateur en session
		type U = UserSessionDTO;
		let session_user = http.session.get::<U>(USER_SESSION).await;
		if let Ok(Some(user)) = session_user.as_ref()
			&& user_id == user.id
		{
			if let Some(avatar) = user.avatar.as_deref() {
				return Ok(http.response.redirect_temporary(avatar));
			} else {
				return fallback();
			}
		}

		let privacy = match query.privacy {
			| QueryParamsPrivacy::Public => UserAccountStatus::Public,
		};

		let Ok(user) = http.user_service.get_account(&user_id, privacy).await
		else {
			return fallback();
		};

		let Some(avatar) = user.avatar else {
			return fallback();
		};

		if user.avatar_display_for.is_member_only()
			&& let Ok(None) = session_user
		{
			return fallback();
		}

		Ok(http.response.redirect_temporary(avatar))
	}

	pub async fn update(
		http: HttpAuthContext<Self, UserSessionDTO>,
		Path(user_id): Path<Uuid>,
		mut multipart: Multipart,
	) -> Result<Json<UpdateAvatarDTO>, HttpContextError<Self>>
	{
		if http.user.id.ne(&user_id) {
			return Err(HttpContextError::unauthorized(http.request));
		}

		let Ok(Some(field)) = multipart.next_field().await else {
			return Err(HttpContextError::bad_request(
				http.request,
				Self::ERROR_REQUIRED_IMAGE,
			));
		};

		let Some(content_type) = field.content_type() else {
			return Err(HttpContextError::bad_request(
				http.request,
				Self::ERROR_CONTENT_TYPE,
			));
		};

		if !["image/jpeg", "image/jpg", "image/png"].contains(&content_type) {
			return Err(HttpContextError::bad_request(
				http.request,
				Self::ERROR_REQUIRED_IMAGE,
			));
		}

		let content_type = String::from(content_type);
		let image_data = field.bytes().await;
		let image_data = image_data.unwrap();

		let new_path = http
			.avatar_service
			.upload(http.user.id, image_data, &content_type)
			.await
			.map_err(|err| {
				match err {
					| AvatarErrorService::IO(err) => {
						HttpContextError::tokio(http.request, err)
					}
					| AvatarErrorService::SQLx(err) => {
						HttpContextError::database(http.request, err)
					}
				}
			})?;

		let mut user = http.user;
		user.avatar = Some(new_path.avatar.to_owned());
		_ = http.session.insert(USER_SESSION, user).await;

		Ok(http.response.json(new_path))
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for AvatarsController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let user_repository = UserRepositoryPostgreSQL {
			query_builder: query_builder.clone(),
		}
		.shared();

		let user_service = UserService {
			user_repository: user_repository.clone(),
		};
		let avatar_service = AvatarService { user_repository };

		Some(Self {
			user_service: user_service.shared(),
			avatar_service: avatar_service.shared(),
		})
	}
}

unsafe impl Send for AvatarsController {}
unsafe impl Sync for AvatarsController {}
