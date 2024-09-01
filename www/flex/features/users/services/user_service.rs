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
// Structure //
// --------- //

pub struct UserService<Database>
{
	pub user_repository: Arc<dyn UserRepository<Database = Database>>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<Database> UserService<Database>
{
	pub async fn get_public_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Public)
			.await
	}

	pub async fn get_private_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Private)
			.await
	}

	pub async fn get_secret_account(
		&self,
		user_id: &Uuid,
	) -> Result<UserEntity, sqlx::Error>
	{
		self.user_repository
			.get(user_id, UserAccountStatus::Secret)
			.await
	}

	pub async fn get_account(
		&self,
		user_id: &Uuid,
		privacy: UserAccountStatus,
	) -> Result<UserEntity, sqlx::Error>
	{
		Ok(match privacy {
			| UserAccountStatus::Public => {
				self.get_public_account(user_id).await?
			}
			| UserAccountStatus::Private => {
				self.get_private_account(user_id).await?
			}
			| UserAccountStatus::Secret => {
				self.get_secret_account(user_id).await?
			}
		})
	}

	pub fn user_repository(
		&self,
	) -> Arc<dyn UserRepository<Database = Database>>
	{
		self.user_repository.clone()
	}

	pub fn shared(self) -> Arc<Self>
	{
		Arc::new(self)
	}
}

unsafe impl<D> Sync for UserService<D> {}
