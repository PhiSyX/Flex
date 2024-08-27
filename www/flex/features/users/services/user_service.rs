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

use crate::features::users::entities::UserEntity;
use crate::features::users::repositories::UserRepository;

// --------- //
// Interface //
// --------- //

#[flex_web_framework::async_trait]
pub trait UserService
{
	async fn get(&self, user_id: &Uuid) -> Result<UserEntity, UserErrorService>;

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
impl UserService for UserServiceImpl {
	async fn get(&self, user_id: &Uuid) -> Result<UserEntity, UserErrorService>
	{
		Ok(self.user_repository.get(user_id).await?)
	}
}

unsafe impl Sync for UserServiceImpl {}
