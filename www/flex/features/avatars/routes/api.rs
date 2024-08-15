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
use flex_web_framework::types::uuid::Uuid;

use crate::features::avatars::controllers::api::v1::AvatarsController;
use crate::{FlexApplicationState, FlexState};

// --------- //
// Structure //
// --------- //

pub struct AvtarsApi_V1_Router;

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
pub enum AuthApi_V1_RouteID
{
	Show { id: Uuid },
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl RouterGroupInterface for AvtarsApi_V1_Router
{
	const GROUP: &'static str = "/api/v1/avatars";
}

impl RouterInterface<FlexState> for AvtarsApi_V1_Router
{
	fn routes(_: &FlexApplicationState) -> RouterCollection<FlexState>
	{
		Self::group().add(
			Router::path(AuthApi_V1_RouteID::Show { id: Default::default() })
				.get(AvatarsController::show),
		)
	}
}

impl RouteIDInterface for AuthApi_V1_RouteID
{
	fn fullpath(&self) -> impl ToString
	{
		let path = match self {
			| Self::Show { id }=> id.to_string(),
		};
		format!("{}{}", AvtarsApi_V1_Router::GROUP, path)
	}

	fn path(&self) -> impl ToString
	{
		match self {
			| Self::Show { .. }=> "/:id",
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
