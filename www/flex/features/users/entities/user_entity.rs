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
pub struct UserEntity
{
	/// ID de l'utilisateur.
	pub id: uuid::Uuid,
	/// Nom d'utilisateur.
	pub name: String,
	/// Mot de passe chiffré.
	pub password: String,
	/// Adresse e-mail de l'utilisateur.
	pub email: String,
	/// Rôle de l'utilisateur.
	pub role: UserRole,
	/// Date de création de l'utilisateur.
	pub created_at: time::DateTime<time::Utc>,
	/// Date de mise à jour des informations de l'utilisateur.
	pub updated_at: time::DateTime<time::Utc>,
}

/// Les différents role utilisateur.
#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(Default)]
#[derive(PartialEq, Eq)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(sqlx::Type)]
#[sqlx(type_name = "users_role", rename_all = "lowercase")]
pub enum UserRole
{
	#[default]
	User,
	Moderator,
	Admin,
}

// -------------- //
// Implémentation //
// -------------- //

impl UserRole
{
	pub fn is_admin(&self) -> bool
	{
		matches!(self, Self::Admin)
	}

	pub fn is_moderator(&self) -> bool
	{
		matches!(self, Self::Moderator)
	}

	pub fn is_user(&self) -> bool
	{
		matches!(self, Self::User)
	}

	pub fn as_str(&self) -> &str
	{
		match self {
			| Self::User => "user",
			| Self::Moderator => "moderator",
			| Self::Admin => "admin",
		}
	}
}
