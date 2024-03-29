// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt;

use flex_web_framework::routing::{Router, RouterBuilder, RouterCollection};
use flex_web_framework::RouterInterface;

use super::features::home::controllers::home_controller::HomeController;
use super::features::TokenController;
use crate::FlexState;

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

impl RouterInterface<FlexState> for ChatRouter
{
	fn routes() -> RouterCollection<FlexState>
	{
		Self::collection()
			.add(Router::path(ChatRouteID::Home).get(HomeController::view))
			.add(Router::path(ChatRouteID::ConnectToken).post(TokenController::token))
	}
}

impl fmt::Display for ChatRouteID
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		let url_path = match self {
			| Self::Home => "/chat",
			| Self::ConnectToken => "/chat/connect/token",
		};

		write!(f, "{}", url_path)
	}
}
