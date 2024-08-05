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

use super::controllers::UuidController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct GenerateRouter;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum GenerateRouteID
{
	UUID_V4,
	UUID_V7,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for GenerateRouter
{
	const GROUP: &'static str = "/generate";
}

impl RouterInterface<FlexState> for GenerateRouter
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group()
			.add(
				Router::path(GenerateRouteID::UUID_V4)
					.get(UuidController::uuid_v4),
			)
			.add(
				Router::path(GenerateRouteID::UUID_V7)
					.get(UuidController::uuid_v7),
			)
	}
}

impl RouteIDInterface for GenerateRouteID
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", GenerateRouter::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::UUID_V4 => "/uuid/v4",
			| Self::UUID_V7 => "/uuid/v7",
		}
	}
}

impl std::fmt::Display for GenerateRouteID
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
