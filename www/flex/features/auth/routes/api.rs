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

use crate::features::auth::controllers::{LoginController, SignupController};
use crate::features::auth::middleware::GuestMiddleware;
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
	Identify,
	Register,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpRouterGroupInterface for AuthApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/auth";
}

impl HttpRouterInterface<FlexState> for AuthApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> HttpRouterCollection<FlexState>
	{
		Self::group()
			.add(
				HttpRouter::path(AuthApi_V1_RouteID::Identify)
					.post(LoginController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::api)),
			)
			.add(
				HttpRouter::path(AuthApi_V1_RouteID::Register)
					.post(SignupController::handle)
					.middleware(middleware::from_fn(GuestMiddleware::api)),
			)
	}
}

impl HttpRouteIDInterface for AuthApi_V1_RouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", AuthApi_V1_Router::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Identify => "/identify",
			| Self::Register => "/register",
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
