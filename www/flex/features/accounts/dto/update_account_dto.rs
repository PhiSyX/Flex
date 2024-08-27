// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::features::users::dto::UserSessionDTO;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(serde::Serialize, serde::Deserialize)]
#[derive(sqlx::FromRow)]
pub struct UpdateAccountDTO
{
	pub firstname: Option<String>,
	pub lastname: Option<String>,
	pub gender: Option<String>,
	pub country: Option<String>,
	pub city: Option<String>,
}

impl<'a> From<(&'a UserSessionDTO, &'a UpdateAccountDTO)> for UserSessionDTO
{
	fn from(
		(session, account): (&'a UserSessionDTO, &'a UpdateAccountDTO),
	) -> Self
	{
		Self {
			avatar: session.avatar.clone(),
			city: account.city.clone(),
			country: account.country.clone(),
			email: session.email.clone(),
			firstname: account.firstname.clone(),
			gender: account.gender.clone(),
			id: session.id,
			lastname: account.lastname.clone(),
			name: session.name.clone(),
			role: session.role,
		}
	}
}
