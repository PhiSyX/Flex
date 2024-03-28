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
use flex_web_framework::sessions::{Expiry, MemoryStore, SessionManagerLayer};
use flex_web_framework::types::time::Duration;
use flex_web_framework::{middleware, RouteIDInterface, RouterGroupInterface, RouterInterface};

use super::controllers::signup_controller::SignupController;
use super::middleware::guest_middleware::GuestMiddleware;
use crate::features::auth::controllers::login_controller::LoginController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct AuthRouter;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum AuthRouteID
{
	Login,
	Signup,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for AuthRouter
{
	const GROUP: &'static str = "/auth";
}

impl RouterInterface<FlexState> for AuthRouter
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group()
			.add(
				Router::path(AuthRouteID::Login)
					.get(LoginController::view)
					.post(LoginController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::handle)),
			)
			.add(
				Router::path(AuthRouteID::Signup)
					.get(SignupController::view)
					.post(SignupController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::handle)),
			)
	}
}

impl RouteIDInterface for AuthRouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", AuthRouter::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Login => "/",
			| Self::Signup => "/signup",
		}
	}
}

impl std::fmt::Display for AuthRouteID
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
