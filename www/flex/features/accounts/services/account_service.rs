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

use crate::features::accounts::dto::UpdateAccountDTO;
use crate::features::accounts::forms::AccountUpdateFormData;
use crate::features::users::repositories::UserRepository;

// --------- //
// Structure //
// --------- //

pub struct AccountService<Database>
{
	pub user_repository: Arc<dyn UserRepository<Database = Database>>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<Database> AccountService<Database>
{
	pub async fn update(
		&self,
		user_id: &Uuid,
		data: AccountUpdateFormData,
	) -> Result<UpdateAccountDTO, sqlx::Error>
	{
		self.user_repository
			.update_account_info(user_id, data)
			.await
	}

	pub fn shared(self) -> Arc<Self>
	{
		Arc::new(self)
	}
}

unsafe impl<D> Sync for AccountService<D> {}
