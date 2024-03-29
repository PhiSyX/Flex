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
use flex_web_framework::{middleware, RouteIDInterface, RouterGroupInterface, RouterInterface};

use crate::features::auth::controllers::users_controller::UsersController;
use crate::features::auth::middleware::auth_middleware::AuthMiddleware;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct AuthApi_V1_Router;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum AuthApi_V1_RouteID
{
	CurrentUser,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for AuthApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/auth";
}

impl RouterInterface<FlexState> for AuthApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group().add(
			Router::path(AuthApi_V1_RouteID::CurrentUser)
				.get(UsersController::current_user)
				// .middleware(middleware::from_fn(AuthMiddleware::required)),
		)
	}
}

impl RouteIDInterface for AuthApi_V1_RouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", AuthApi_V1_Router::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::CurrentUser => "/@me",
		}
	}
}

impl std::fmt::Display for AuthApi_V1_RouteID
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
