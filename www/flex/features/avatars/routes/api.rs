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

use crate::features::avatars::controllers::api::v1::AvatarsController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct AvatarsApi_V1_Router;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum AvatarsApi_V1_RouteID<'a>
{
	Show
	{
		user_id: &'a str
	},
	Update
	{
		user_id: &'a str
	},
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for AvatarsApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/avatars";
}

impl RouterInterface<FlexState> for AvatarsApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group()
			.add(
				Router::path(AvatarsApi_V1_RouteID::Show {
					user_id: ":user_id",
				})
				.get(AvatarsController::show),
			)
			.add(
				Router::path(AvatarsApi_V1_RouteID::Update {
					user_id: ":user_id",
				})
				.put(AvatarsController::update),
			)
	}
}

impl RouteIDInterface for AvatarsApi_V1_RouteID<'_>
{
	fn fullpath(&self) -> impl ToString
	{
		format!("{}{}", AvatarsApi_V1_Router::GROUP, self.path().to_string())
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Update { user_id: id } => format!("/{id}"),
			| Self::Show { user_id: id } => format!("/{id}"),
		}
	}
}

impl std::fmt::Display for AvatarsApi_V1_RouteID<'_>
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		write!(f, "{}", self.fullpath().to_string())
	}
}
