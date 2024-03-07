// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

#![allow(non_camel_case_types)]

pub mod commands;

pub mod config
{
	pub mod env;
	pub mod flex;
}

pub mod constant;

mod src;

pub use self::src::ChatApplication;

// ---- //
// Type //
// ---- //

pub type Flex =
	flex_web_framework::AxumApplication<FlexState, config::env::flex_env, commands::flex_clix>;
pub type FlexApplicationState = flex_web_framework::AxumState<FlexState>;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct FlexState
{
	socket_io: socketioxide::SocketIo,
}

// -------------- //
// Implémentation //
// -------------- //

impl FlexState
{
	pub fn socket_io(&self) -> &socketioxide::SocketIo
	{
		&self.socket_io
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl flex_web_framework::http::request::FromRef<FlexApplicationState> for FlexState
{
	fn from_ref(axum_state: &FlexApplicationState) -> Self
	{
		axum_state.state().clone()
	}
}
