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

use sqlx::types::Uuid;

use crate::features::users::entities::{UserAccountStatus, UserEntity};
use crate::features::users::repositories::UserRepository;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait UserService
{
	async fn get_public_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>;

	async fn get_private_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>;

	async fn get_secret_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>;

	async fn get_account(
		&self,
		user_id: &Uuid,
		privacy: UserAccountStatus,
	) -> Result<UserEntity, sqlx::Error>;

	fn user_repository(&self) -> Arc<dyn UserRepository>;

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

pub struct UserServiceImpl
{
	pub user_repository: Arc<dyn UserRepository>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(thiserror::Error)]
#[error("\n\t{}: {0}", std::any::type_name::<Self>())]
pub enum UserErrorService
{
	SQLx(#[from] sqlx::Error),
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

#[flex_web_framework::async_trait]
impl UserService for UserServiceImpl
{
	async fn get_public_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Public)
			.await
	}

	async fn get_private_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Private)
			.await
	}

	async fn get_secret_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Secret)
			.await
	}

	async fn get_account(
		&self,
		user_id: &Uuid,
		privacy: UserAccountStatus,
	) -> Result<UserEntity, sqlx::Error>
	{
		Ok(match privacy {
			| UserAccountStatus::Public => self.get_public_account(user_id),
			| UserAccountStatus::Private => self.get_private_account(user_id),
			| UserAccountStatus::Secret => self.get_secret_account(user_id),
		}
		.await?)
	}

	fn user_repository(&self) -> Arc<dyn UserRepository>
	{
		self.user_repository.clone()
	}
}

unsafe impl Sync for UserServiceImpl {}
