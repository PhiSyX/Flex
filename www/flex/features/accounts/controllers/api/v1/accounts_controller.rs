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
use flex_web_framework::http::{
	Extensions,
	HttpAuthContext,
	HttpContextError,
	HttpContextInterface,
	IntoResponse,
};
use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::accounts::forms::AccountUpdateFormData;
use crate::features::accounts::services::{AccountService, AccountServiceImpl};
use crate::features::users::dto::UserSessionDTO;
use crate::features::users::repositories::{
	UserRepository,
	UserRepositoryPostgreSQL,
};
use crate::features::users::sessions::constant::USER_SESSION;
use crate::FlexState;

// --------- //
// Structure //
// --------- //

pub struct AccountsController
{
	account_service: Arc<dyn AccountService>,
}

// -------------- //
// Implémentation //
// -------------- //

impl AccountsController
{
	pub async fn update(
		http: HttpAuthContext<Self, UserSessionDTO>,
		Form(data): Form<AccountUpdateFormData>,
	) -> Result<impl IntoResponse, HttpContextError<Self>>
	{
		let update_account_dto = http
			.account_service
			.update(&http.user.id, data)
			.await
			.map_err(|err| HttpContextError::database(http.request, err))?;

		let session = UserSessionDTO::from((&http.user, &update_account_dto));
		_ = http.session.insert(USER_SESSION, session).await;

		Ok(http.response.json(update_account_dto))
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpContextInterface for AccountsController
{
	type State = FlexState;

	fn constructor(ext: &Extensions, _: Self::State) -> Option<Self>
	{
		let db_service = ext.get::<DatabaseService<PostgreSQLDatabase>>()?;

		let query_builder = SQLQueryBuilder::new(db_service.clone());

		let user_repository = UserRepositoryPostgreSQL {
			query_builder: query_builder.clone(),
		};

		let account_service = AccountServiceImpl {
			user_repository: user_repository.shared(),
		};
		Some(Self {
			account_service: account_service.shared(),
		})
	}
}

unsafe impl Send for AccountsController {}
unsafe impl Sync for AccountsController {}
