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

use flex_web_framework::http::request::Path;
use flex_web_framework::http::{
	Extensions,
	HttpContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::types::uuid::Uuid;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::avatars::repositories::{
	AvatarRepository,
	AvatarRepositoryPostgreSQL,
};
use crate::features::avatars::services::{
	AvatarErrorService,
	AvatarService,
	AvatarServiceImpl,
};
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct AvatarsController
{
	avatar_service: Arc<dyn AvatarService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl AvatarsController
{
	pub async fn show(
		http: HttpContext<Self>,
		Path(id): Path<Uuid>,
	) -> Result<impl IntoResponse, HttpContextError<Self>>
	{
		let avatar = http.avatar_service.get(id).await.map_err(|err| {
			match err {
				| AvatarErrorService::SQLx(err) => {
					HttpContextError::Database {
						request: http.request,
						sqlx: err,
					}
				}
			}
		})?;

		Ok(http.response.redirect_temporary(avatar.path))
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

		let avatar_repository = AvatarRepositoryPostgreSQL {
			query_builder: query_builder.clone(),
		};

		let avatar_service = AvatarServiceImpl {
			avatar_repository: avatar_repository.shared(),
		};

		Some(Self {
			avatar_service: avatar_service.shared(),
		})
	}
}

unsafe impl Send for AvatarsController {}
unsafe impl Sync for AvatarsController {}
