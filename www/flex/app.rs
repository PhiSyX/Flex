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
	mod chat;

	pub use self::chat::ChatApplication;
}

pub use self::features::*;

// ---- //
// Type //
// ---- //

pub type Flex =
	flex_web_framework::AxumApplication<FlexState, config::env::FlexEnv, commands::FlexCLI>;
pub type FlexApplicationState = flex_web_framework::AxumState<FlexState>;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub enum FlexState
{
	Chat
	{
		socket_io: socketioxide::SocketIo,
	},
}

// -------------- //
// Implémentation //
// -------------- //

impl FlexState
{
	pub fn socket_io(&self) -> &socketioxide::SocketIo
	{
		let Self::Chat { socket_io } = self else {
			panic!("N'est pas une application Socket.IO")
		};
		socket_io
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
