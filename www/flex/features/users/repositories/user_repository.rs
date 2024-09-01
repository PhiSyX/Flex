// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod postgres;

use std::sync::Arc;

use flex_web_framework::query_builder::SQLQueryBuilder;
use flex_web_framework::types::email;
use flex_web_framework::DatabaseService;
use sqlx::types::Uuid;

pub use self::postgres::*;
use crate::features::accounts::dto::UpdateAccountDTO;
use crate::features::accounts::forms::AccountUpdateFormData;
use crate::features::avatars::dto::UpdateAvatarDTO;
use crate::features::users::dto::UserNewActionDTO;
use crate::features::users::entities::{UserAccountStatus, UserEntity};

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait UserRepository
{
	type Database;

	/// Crée un nouvel utilisateur.
	async fn create(
		&self,
		new_user: UserNewActionDTO,
	) -> Result<UserEntity, sqlx::Error>;

	/// Récupère un utilisateur en fonction de son ID et de sa confidentialité.
	async fn get(
		&self,
		id: &Uuid,
		private: UserAccountStatus,
	) -> Result<UserEntity, sqlx::Error>;

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

	fn query_builder(
		&self,
	) -> &SQLQueryBuilder<DatabaseService<Self::Database>>;

	fn shared(self) -> Arc<Self>
	where
		Self: Sized,
	{
		Arc::new(self)
	}
}
