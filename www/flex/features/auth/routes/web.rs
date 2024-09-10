// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::http::routing::{
	HttpRouteIDInterface,
	HttpRouter,
	HttpRouterBuilder,
	HttpRouterCollection,
	HttpRouterGroupInterface,
	HttpRouterInterface,
};
use flex_web_framework::middleware;

use crate::features::auth::controllers::{
	LoginController,
	LogoutController,
	SignupController,
};
use crate::features::auth::middleware::{AuthMiddleware, GuestMiddleware};
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
	Logout,
	Signup,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpRouterGroupInterface for AuthRouter
{
	const GROUP: &'static str = "/auth";
}

impl HttpRouterInterface<FlexState> for AuthRouter
{
	fn routes(_: &FlexApplicationState) -> HttpRouterCollection<FlexState>
	{
		Self::group()
			.add(
				HttpRouter::path(AuthRouteID::Login)
					.get(LoginController::view)
					.post(LoginController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::redirect)),
			)
			.add(
				HttpRouter::path(AuthRouteID::Logout)
					.get(LogoutController::view)
					.post(LogoutController::handle) // FIXME: method spoofing
					.delete(LogoutController::handle)
					.middleware(middleware::from_fn(AuthMiddleware::required)),
			)
			.add(
				HttpRouter::path(AuthRouteID::Signup)
					.get(SignupController::view)
					.post(SignupController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::redirect)),
			)
	}
}

impl HttpRouteIDInterface for AuthRouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", AuthRouter::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Login => "/",
			| Self::Logout => "/logout",
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
