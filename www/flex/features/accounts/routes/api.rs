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

use crate::features::accounts::controllers::api::v1::AccountsController;
use crate::features::auth::middleware::AuthMiddleware;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct AccountsApi_V1_Router;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum AccountsApi_V1_RouteID<'a>
{
	Update
	{
		id: &'a str
	},
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpRouterGroupInterface for AccountsApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/accounts";
}

impl HttpRouterInterface<FlexState> for AccountsApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> HttpRouterCollection<FlexState>
	{
		Self::group().add(
			HttpRouter::path(AccountsApi_V1_RouteID::Update { id: "{user_id}" })
				.put(AccountsController::update)
				.middleware(middleware::from_fn(AuthMiddleware::required)),
		)
	}
}

impl HttpRouteIDInterface for AccountsApi_V1_RouteID<'_>
{
	fn fullpath(&self) -> impl ToString
	{
		format!(
			"{}{}",
			AccountsApi_V1_Router::GROUP,
			self.path().to_string()
		)
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Update { id } => format!("/{id}"),
		}
	}
}

impl std::fmt::Display for AccountsApi_V1_RouteID<'_>
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
