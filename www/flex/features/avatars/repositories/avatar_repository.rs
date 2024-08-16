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
use flex_web_framework::types::uuid::Uuid;

use crate::features::avatars::entities::AvatarEntity;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait AvatarRepository
{
	/// Récupère une entrée à partir d'un ID utilisateur.
	async fn get(&self, user_id: Uuid)
		-> Result<AvatarEntity, sqlx::Error>;

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

pub struct AvatarRepositoryPostgreSQL
{
	pub query_builder: SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl AvatarRepositoryPostgreSQL
{
	/// Nom de la table de ce repository.
	pub const TABLE_NAME: &'static str = "avatars";
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl AvatarRepository for AvatarRepositoryPostgreSQL
{
	async fn get(&self, user_id: Uuid)
		-> Result<AvatarEntity, sqlx::Error>
	{
		let id = user_id.to_string();
		let raw_query = format!(
			"SELECT {avatars}.* FROM {avatars} 
			LEFT JOIN {accounts} on {accounts}.avatar_id = {avatars}.id
			WHERE {accounts}.user_id=$1::uuid", 
			avatars = Self::TABLE_NAME,
			accounts = "accounts",
		);
		let record = self.query_builder.fetch_one(&raw_query, &[&id]).await?;
		Ok(record)
	}
}
