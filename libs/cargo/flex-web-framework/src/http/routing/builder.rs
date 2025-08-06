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

use axum::response::IntoResponse;

use super::HttpRouter;
use crate::AxumState;
use crate::http::routing::HttpRouteIDInterface;

// --------- //
// Interface //
// --------- //

pub trait HttpRouterBuilder
{
	type State: 'static + Clone + Send + Sync;

	/// Initialisation d'une route.
	fn path(url_path: impl HttpRouteIDInterface + fmt::Debug) -> Self;

	/// Applique une route de n'importe quel type.
	fn any<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type DELETE.
	fn delete<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type GET.
	fn get<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type HEAD.
	fn head<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type OPTIONS.
	fn options<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type PATCH.
	fn patch<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type POST.
	fn post<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type PUT.
	fn put<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	/// Applique une route de type TRACE.
	fn trace<Action, ActionType>(self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static;

	fn middleware<L>(self, layer: L) -> Self
	where
		L: tower_layer::Layer<axum::routing::Route>
			+ 'static
			+ Clone
			+ Send + Sync
		,
		L::Service: tower_service::Service<axum::extract::Request, Error = core::convert::Infallible>
			+ 'static
			+ Clone
			+ Send + Sync
		,
		<L::Service as tower_service::Service<axum::extract::Request>>::Response:
			'static
			+ IntoResponse
		,
		<L::Service as tower_service::Service<axum::extract::Request>>::Future:
			'static
			+ Send
		,
	;

	fn build(self) -> HttpRouter<Self::State>;
}
