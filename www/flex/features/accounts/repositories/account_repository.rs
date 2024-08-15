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

use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};

use crate::features::accounts::dto::UserAccountDTO;
use crate::features::accounts::entities::AccountEntity;
use crate::features::avatars::repositories::AvatarRepositoryPostgreSQL;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait AccountRepository
{
	async fn get(
		&self,
		id: sqlx::types::Uuid,
	) -> Result<AccountEntity, sqlx::Error>;

	async fn find_by_user_id(
		&self,
		user_id: sqlx::types::Uuid,
	) -> Result<UserAccountDTO, sqlx::Error>;

	fn shared(self) -> Arc<Self>
	where
		Self: Sized,
	{
		Arc::new(self)
	}
}

// --------- //
// Structure //
// --------- //

pub struct AccountRepositoryPostgreSQL
{
	pub query_builder: SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl AccountRepositoryPostgreSQL
{
	/// Nom de la table de ce repository.
	pub const TABLE_NAME: &'static str = "accounts";
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl AccountRepository for AccountRepositoryPostgreSQL
{
	async fn get(
		&self,
		id: sqlx::types::Uuid,
	) -> Result<AccountEntity, sqlx::Error>
	{
		let id = id.to_string();
		let raw_query = format!(
			"SELECT {accounts}.* FROM {accounts} WHERE {accounts}.id = $1::uuid",
			accounts = Self::TABLE_NAME,
		);
		let record = self.query_builder.fetch_one(&raw_query, &[&id]).await?;
		Ok(record)
	}

	async fn find_by_user_id(
		&self,
		user_id: sqlx::types::Uuid,
	) -> Result<UserAccountDTO, sqlx::Error>
	{
		let user_id = user_id.to_string();
		let raw_query = format!(
			"
			SELECT {accounts}.*, {avatars}.path as avatar FROM {accounts} 
			LEFT JOIN {avatars} ON {avatars}.id = {accounts}.avatar_id
			WHERE {accounts}.user_id = $1::uuid
			",
			accounts = Self::TABLE_NAME,
			avatars = AvatarRepositoryPostgreSQL::TABLE_NAME,
		);
		let record = self
			.query_builder
			.fetch_one(&raw_query, &[&user_id])
			.await?;
		Ok(record)
	}
}
