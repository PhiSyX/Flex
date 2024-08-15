// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub mod commands;

pub mod config
{
	pub mod chat;
	pub mod env;
}

pub mod constant;

mod features
{
	mod accounts;
	mod auth;
	mod avatars;
	mod chat;
	mod generate;
	mod users;

	pub use self::auth::AuthApplication;
	pub use self::avatars::AvatarsApplication;
	pub use self::chat::ChatApplication;
	pub use self::generate::GenerateApplication;
	pub use self::users::UsersApplication;
}

mod templates
{
	pub mod layouts
	{
		mod base_layout;

		pub use self::base_layout::*;
	}
}

use flex_web_framework::http::request::FromRef;

pub use self::features::*;

// ---- //
// Type //
// ---- //

pub type Flex = flex_web_framework::AxumApplication<
	FlexState,
	config::env::FlexEnv,
	commands::FlexCLI,
>;
pub type FlexApplicationState = flex_web_framework::AxumState<FlexState>;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub enum FlexState
{
	Initial,
}

// -------------- //
// Implémentation //
// -------------- //

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FromRef<FlexApplicationState> for FlexState
{
	fn from_ref(axum_state: &FlexApplicationState) -> Self
	{
		axum_state.state().clone()
	}
}
