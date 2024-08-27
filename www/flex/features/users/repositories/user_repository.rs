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
use flex_web_framework::types::email;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};
use sqlx::types::Uuid;

use crate::features::accounts::dto::UpdateAccountDTO;
use crate::features::accounts::forms::AccountUpdateFormData;
use crate::features::avatars::dto::UpdateAvatarDTO;
use crate::features::users::dto::UserNewActionDTO;
use crate::features::users::entities::UserEntity;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait UserRepository
{
	/// Crée un nouvel utilisateur.
	async fn create(
		&self,
		new_user: UserNewActionDTO,
	) -> Result<UserEntity, sqlx::Error>;

	/// Récupère un utilisateur en fonction de son ID.
	async fn get(&self, id: &Uuid) -> Result<UserEntity, sqlx::Error>;

	/// Cherche un utilisateur par son adresse e-mail.
	async fn find_by_email(
		&self,
		email: &email::EmailAddress,
	) -> Result<UserEntity, sqlx::Error>;

	/// Cherche un utilisateur par son nom d'utilisateur.
	async fn find_by_name(&self, name: &str)
		-> Result<UserEntity, sqlx::Error>;

	/// Cherche un utilisateur par son adresse e-mail ou nom d'utilisateur.
	async fn find_by_email_or_name(
		&self,
		email: &email::EmailAddress,
		name: &str,
	) -> Result<UserEntity, sqlx::Error>;

	async fn update_avatar_path(
		&self,
		user_id: &Uuid,
		path: &str,
	) -> Result<UpdateAvatarDTO, sqlx::Error>;

	async fn update_account_info(
		&self,
		user_id: &Uuid,
		payload: AccountUpdateFormData,
	) -> Result<UpdateAccountDTO, sqlx::Error>;

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

pub struct UserRepositoryPostgreSQL
{
	pub query_builder: SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl UserRepositoryPostgreSQL
{
	/// Nom de la table de ce repository.
	pub const TABLE_NAME: &'static str = "users";
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl UserRepository for UserRepositoryPostgreSQL
{
	async fn create(
		&self,
		new_user: UserNewActionDTO,
	) -> Result<UserEntity, sqlx::Error>
	{
		let raw_query = format!(
			"INSERT INTO {} \
			 (id,name,email,password,role,created_at,updated_at) VALUES \
			 (gen_random_uuid(),$1,$2,$3,$4::users_role,NOW(),NOW())",
			Self::TABLE_NAME
		);
		let payload = [
			&new_user.username,
			new_user.email_address.as_ref(),
			new_user.password.expose(),
			new_user.role.as_str(),
		];
		let record = self.query_builder.insert(&raw_query, &payload).await?;
		Ok(record)
	}

	async fn get(&self, id: &Uuid) -> Result<UserEntity, sqlx::Error>
	{
		let id = id.to_string();
		let raw_query = format!(
			"SELECT * FROM {users} WHERE id=$1::uuid",
			users = Self::TABLE_NAME
		);
		let record = self.query_builder.fetch_one(&raw_query, &[&id]).await?;
		Ok(record)
	}

	async fn find_by_email(
		&self,
		email: &email::EmailAddress,
	) -> Result<UserEntity, sqlx::Error>
	{
		let raw_query = format!(
			"SELECT * FROM {users} WHERE email=$1",
			users = Self::TABLE_NAME
		);
		let record = self
			.query_builder
			.fetch_one(&raw_query, &[email.as_ref()])
			.await?;
		Ok(record)
	}

	async fn find_by_email_or_name(
		&self,
		email: &email::EmailAddress,
		name: &str,
	) -> Result<UserEntity, sqlx::Error>
	{
		let raw_query = format!(
			"SELECT * FROM {users} WHERE email=$1 OR name=$2",
			users = Self::TABLE_NAME
		);
		let record = self
			.query_builder
			.fetch_one(&raw_query, &[email.as_ref(), name])
			.await?;
		Ok(record)
	}

	async fn find_by_name(&self, name: &str)
		-> Result<UserEntity, sqlx::Error>
	{
		let raw_query = format!(
			"SELECT * FROM {users} WHERE name=$1",
			users = Self::TABLE_NAME
		);
		let record = self.query_builder.fetch_one(&raw_query, &[name]).await?;
		Ok(record)
	}

	async fn update_avatar_path(
		&self,
		user_id: &Uuid,
		path: &str,
	) -> Result<UpdateAvatarDTO, sqlx::Error>
	{
		let id = user_id.to_string();

		let raw_query = format!(
			"UPDATE {users} SET avatar = $2 WHERE id=$1::uuid",
			users = Self::TABLE_NAME,
		);
		let record =
			self.query_builder.update(&raw_query, &[&id, path]).await?;
		Ok(record)
	}

	async fn update_account_info(
		&self,
		user_id: &Uuid,
		payload: AccountUpdateFormData,
	) -> Result<UpdateAccountDTO, sqlx::Error>
	{
		let id = user_id.to_string();

		let raw_query = format!(
			"UPDATE {users} SET firstname=$2, lastname=$3, gender=$4, \
			 country=$5, city=$6 WHERE id=$1::uuid",
			users = Self::TABLE_NAME,
		);

		let record = self
			.query_builder
			.update(
				&raw_query,
				&[
					&id,
					payload.firstname.as_deref().unwrap_or_default(),
					payload.lastname.as_deref().unwrap_or_default(),
					payload.gender.as_deref().unwrap_or_default(),
					payload.country.as_deref().unwrap_or_default(),
					payload.city.as_deref().unwrap_or_default(),
				],
			)
			.await?;

		Ok(record)
	}
}
