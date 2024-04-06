// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod adapter;
mod database;
mod extension;
pub mod extract;
pub mod http;
mod interface;
pub mod routing;
pub mod security;
mod server;
pub mod settings;
pub mod types;
pub mod view;

pub use axum::{async_trait, middleware, Extension};
pub use flex_web_framework_macro::{html, vite, View};
pub use tower_sessions as sessions;

pub use self::database::*;
pub use self::extension::*;
pub use self::interface::*;
pub use self::server::ServerState as AxumState;
pub use self::settings::*;
pub use self::view::*;

// ---- //
// Type //
// ---- //

pub type AxumApplication<
	S = (),
	E = (),
	C = ()
> = flex_kernel::Kernel<
	adapter::Adapter<
		S,
		E,
		C
	>,
	E,
	C
>;
pub type AxumRouter<S> = axum::Router<AxumState<S>>;
