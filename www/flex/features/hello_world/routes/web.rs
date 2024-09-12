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
	HttpRouterInterface,
};

use crate::features::hello_world::controllers::HelloWorldWebController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct HelloWorldWebRouter;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum HelloWorldWebRouteID
{
	HelloWeb,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HttpRouterInterface<FlexState> for HelloWorldWebRouter
{
	fn routes(_: &FlexApplicationState) -> HttpRouterCollection<FlexState>
	{
		Self::collection().add(
			HttpRouter::path(HelloWorldWebRouteID::HelloWeb)
				.get(HelloWorldWebController::handle_web),
		)
	}
}

impl HttpRouteIDInterface for HelloWorldWebRouteID
{
	fn fullpath(&self) -> impl ToString
	{
		self.path().to_string()
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::HelloWeb => "/web/hello",
		}
	}
}

impl std::fmt::Display for HelloWorldWebRouteID
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}