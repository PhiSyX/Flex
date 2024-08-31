// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::query_builder::SQLQuerySelectAllFields;
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
	/// Chemin de l'avatar de l'utilisateur.
	/// URL ou chemin absolu de l'avatar (par rapport au projet).
	pub avatar: Option<String>,
	/// Affiché l'avatar uniquement pour...
	pub avatar_display_for: UserAvatarDisplayFor,
	/// Prénom de l'utilisateur.
	pub firstname: Option<String>,
	/// Nom de l'utilisateur.
	pub lastname: Option<String>,
	/// Date d'anniversaire de l'utilisateur.
	pub birthday: Option<sqlx::types::chrono::NaiveDate>,
	/// Le genre de l'utilisateur.
	pub gender: Option<String>,
	/// Le pays de l'utilisateur.
	pub country: Option<String>,
	/// La ville de l'utilisateur.
	pub city: Option<String>,
	/// Le status du compte utilisateur.
	pub account_status: UserAccountStatus,
	/// Date de création de l'utilisateur.
	pub created_at: time::DateTime<time::Utc>,
	/// Date de mise à jour des informations de l'utilisateur.
	pub updated_at: time::DateTime<time::Utc>,
}

// ----------- //
// Énumération //
// ----------- //

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
	SysAdmin,
	NetAdmin,
}

/// Les différents status d'un compte.
#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(Default)]
#[derive(PartialEq, Eq)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(sqlx::Type)]
#[sqlx(type_name = "users_account_status", rename_all = "lowercase")]
pub enum UserAccountStatus
{
	Public,
	Private,
	#[default]
	Secret,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(Default)]
#[derive(PartialEq, Eq)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(sqlx::Type)]
#[sqlx(type_name = "users_avatar_display_for", rename_all = "snake_case")]
pub enum UserAvatarDisplayFor
{
	#[serde(rename = "member_only")]
	MemberOnly,
	#[default]
	Public,
}

// -------------- //
// Implémentation //
// -------------- //

impl UserRole
{
	pub fn is_admin(&self) -> bool
	{
		matches!(self, Self::Admin | Self::SysAdmin | Self::NetAdmin)
	}

	pub fn is_sysadmin(&self) -> bool
	{
		matches!(self, Self::SysAdmin)
	}

	pub fn is_netadmin(&self) -> bool
	{
		matches!(self, Self::NetAdmin)
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
			| Self::Admin => "admin",
			| Self::Moderator => "moderator",
			| Self::NetAdmin => "netadmin",
			| Self::SysAdmin => "sysadmin",
			| Self::User => "user",
		}
	}

	pub fn as_string(&self) -> String
	{
		self.as_str().to_owned()
	}
}

impl UserAccountStatus
{
	pub fn as_str(&self) -> &str
	{
		match self {
			| Self::Public => "public",
			| Self::Private => "private",
			| Self::Secret => "secret",
		}
	}

	pub fn as_string(&self) -> String
	{
		self.as_str().to_string()
	}
}

impl UserAvatarDisplayFor
{
	pub fn is_member_only(&self) -> bool
	{
		matches!(self, Self::MemberOnly)
	}

	pub fn is_public(&self) -> bool
	{
		matches!(self, Self::Public)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

// TODO: utiliser les proc-macro directement sur la structure pour générer ces
// champs.
impl SQLQuerySelectAllFields for UserEntity
{
	fn fields() -> Vec<&'static str>
	{
		[
			"id",
			"name",
			"password",
			"email",
			"role",
			"avatar",
			"avatar_display_for",
			"firstname",
			"lastname",
			"birthday",
			"gender",
			"country",
			"city",
			"account_status",
			"created_at",
			"updated_at",
		]
		.to_vec()
	}
}
