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
pub struct AvatarEntity
{
	/// ID de l'avatar.
	pub id: uuid::Uuid,
	/// URL ou chemin absolu de l'avatar (par rapport au projet).
	pub path: String,
	/// Affiché l'avatar uniquement pour...
	pub display_for: AvatarDisplayFor,
	/// Date de création de l'avatar.
	pub created_at: time::DateTime<time::Utc>,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(Default)]
#[derive(PartialEq, Eq)]
#[derive(serde::Deserialize)]
#[derive(sqlx::Type)]
#[sqlx(type_name = "avatars_display", rename_all = "lowercase")]
pub enum AvatarDisplayFor
{
	#[serde(rename = "member_only")]
	MemberOnly,
	#[default]
	Public,
}
