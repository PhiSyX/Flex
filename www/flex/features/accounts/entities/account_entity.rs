// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::{time, uuid};

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(serde::Deserialize)]
#[derive(sqlx::FromRow)]
pub struct AccountEntity
{
	/// ID du compte
	pub id: uuid::Uuid,
	/// ID de l'utilisateur.
	pub user_id: uuid::Uuid,
	/// ID de l'avatar.
	pub avatar_id: Option<uuid::Uuid>,
	// pub avatar: Option<String>,
	/// Prénom de l'utilisateur.
	pub firstname: Option<String>,
	/// Nom de l'utilisateur.
	pub lastname: Option<String>,
	/// Le genre de l'utilisateur.
	pub gender: Option<String>,
	/// Le pays de l'utilisateur.
	pub country: Option<String>,
	/// La ville de l'utilisateur.
	pub city: Option<String>,
	/// Le status du compte utilisateur.
	pub status: AccountStatus,
	/// Date de création de l'utilisateur.
	pub created_at: time::DateTime<time::Utc>,
	/// Date de mise à jour des informations de l'utilisateur.
	pub updated_at: time::DateTime<time::Utc>,
}

/// Les différents status d'un compte.
#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(Default)]
#[derive(PartialEq, Eq)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(sqlx::Type)]
#[sqlx(type_name = "accounts_status", rename_all = "lowercase")]
pub enum AccountStatus
{
	Public,
	Private,
	#[default]
	Secret,
}

// -------------- //
// Implémentation //
// -------------- //

impl AccountStatus
{
	pub fn as_str(&self) -> &str
	{
		match self {
			| Self::Public => "public",
			| Self::Private => "private",
			| Self::Secret => "secret",
		}
	}
}
