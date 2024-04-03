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
use flex_web_framework::{RouteIDInterface, RouterGroupInterface, RouterInterface};

use crate::features::chat::connect::TokenController;
use crate::features::chat::home::controllers::HomeController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct ChatRouter;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum ChatRouteID
{
	Home,
	ConnectToken,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for ChatRouter
{
	const GROUP: &'static str = "/chat";
}

impl RouterInterface<FlexState> for ChatRouter
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group()
			.add(Router::path(ChatRouteID::Home).get(HomeController::view))
			.add(Router::path(ChatRouteID::ConnectToken).post(TokenController::token))
	}
}

impl RouteIDInterface for ChatRouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", ChatRouter::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Home => "/",
			| Self::ConnectToken => "/connect/token",
		}
	}
}

impl std::fmt::Display for ChatRouteID
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
