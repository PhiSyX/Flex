// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::routing::{Router, RouterBuilder, RouterCollection};
use flex_web_framework::{
	RouteIDInterface,
	RouterGroupInterface,
	RouterInterface,
};

use crate::features::users::controllers::api::v1::UsersController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct UsersApi_V1_Router;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum UsersApi_V1_RouteID<'a>
{
	Info
	{
		user_id: &'a str,
	},
	Session,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for UsersApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/users";
}

impl RouterInterface<FlexState> for UsersApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group()
			.add(
				Router::path(UsersApi_V1_RouteID::Info { user_id: ":userid" })
					.get(UsersController::get_user_info),
			)
			.add(
				Router::path(UsersApi_V1_RouteID::Session)
					.get(UsersController::session),
			)
	}
}

impl RouteIDInterface for UsersApi_V1_RouteID<'_>
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", UsersApi_V1_Router::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Info { user_id } => format!("/{user_id}/info"),
			| Self::Session => String::from("/@me"),
		}
	}
}

impl std::fmt::Display for UsersApi_V1_RouteID<'_>
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
