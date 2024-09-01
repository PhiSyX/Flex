// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::types::email;
use flex_web_framework::{DatabaseService, PostgreSQLDatabase};
use sqlx::types::Uuid;

use super::UserRepository;
use crate::features::accounts::dto::UpdateAccountDTO;
use crate::features::accounts::forms::AccountUpdateFormData;
use crate::features::avatars::dto::UpdateAvatarDTO;
use crate::features::users::dto::UserNewActionDTO;
use crate::features::users::entities::{UserAccountStatus, UserEntity};

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
	type Database = PostgreSQLDatabase;

	async fn create(
		&self,
		new_user: UserNewActionDTO,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.query_builder
			.table(Self::TABLE_NAME)
			.insert([
				("id", "gen_random_uuid()"),
				("name", &new_user.username),
				("email", new_user.email_address.as_ref()),
				("password", new_user.password.expose()),
				("role::users_role", new_user.role.as_str()),
				("created_at", "now()"),
				("updated_at", "now()"),
			])
			.returning_all()
			.execute()
			.await
	}

	async fn get(
		&self,
		user_id: &Uuid,
		privacy: UserAccountStatus,
	) -> Result<UserEntity, sqlx::Error>
	{
		let user_id = user_id.to_string();
		let privacy = privacy.as_string();

		self.query_builder
			.table(Self::TABLE_NAME)
			.select_all()
			.where_and([
				("id::uuid", &user_id),
				("account_status::users_account_status", &privacy),
			])
			.fetch_one()
			.await
	}

	async fn find_by_email(
		&self,
		email: &email::EmailAddress,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.query_builder
			.table(Self::TABLE_NAME)
			.select_all()
			.where_and(("email", email))
			.fetch_one()
			.await
	}

	async fn find_by_email_or_name(
		&self,
		email: &email::EmailAddress,
		name: &str,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.query_builder
			.table(Self::TABLE_NAME)
			.select_all()
			.where_or([("email", email.as_ref()), ("name", name)])
			.fetch_one()
			.await
	}

	async fn find_by_name(&self, name: &str)
		-> Result<UserEntity, sqlx::Error>
	{
		self.query_builder()
			.table(Self::TABLE_NAME)
			.select_all()
			.where_eq(("name", name))
			.fetch_one()
			.await
	}

	async fn update_avatar_path(
		&self,
		user_id: &Uuid,
		path: &str,
	) -> Result<UpdateAvatarDTO, sqlx::Error>
	{
		self.query_builder
			.table(Self::TABLE_NAME)
			.update(("avatar", path))
			.where_eq(("id::uuid", user_id))
			.returning_all()
			.execute()
			.await
	}

	async fn update_account_info(
		&self,
		user_id: &Uuid,
		payload: AccountUpdateFormData,
	) -> Result<UpdateAccountDTO, sqlx::Error>
	{
		let firstname = payload.firstname.as_deref().unwrap_or_default();
		let lastname = payload.lastname.as_deref().unwrap_or_default();
		let gender = payload.gender.as_deref().unwrap_or_default();
		let country = payload.country.as_deref().unwrap_or_default();
		let city = payload.city.as_deref().unwrap_or_default();

		self.query_builder
			.table(Self::TABLE_NAME)
			.update([
				("firstname", firstname),
				("lastname", lastname),
				("gender", gender),
				("country", country),
				("city", city),
			])
			.where_eq(("id::uuid", user_id))
			.returning_all()
			.execute()
			.await
	}

	fn query_builder(
		&self,
	) -> &SQLQueryBuilder<DatabaseService<PostgreSQLDatabase>>
	{
		&self.query_builder
	}
}
