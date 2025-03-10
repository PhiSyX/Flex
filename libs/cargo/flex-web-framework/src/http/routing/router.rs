// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashSet;
use std::fmt;

use axum::response::IntoResponse;

use super::HttpRouterBuilder;
use crate::http::routing::HttpRouteIDInterface;
use crate::{http, AxumState};

// --------- //
// Structure //
// --------- //

pub struct HttpRouter<S>
{
	/// Nom de la route.
	pub name: String,
	/// Chemin complet d'une URL de route.
	pub fullpath: String,
	/// Méthode HTTP de la route.
	pub methods: HashSet<http::Method>,
	/// Action associé à un chemin d'URL.
	pub action: axum::routing::MethodRouter<AxumState<S>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<S> HttpRouter<S>
{
	pub fn methods(&self) -> impl Iterator<Item = &http::Method>
	{
		self.methods.iter()
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<UserState> HttpRouterBuilder for HttpRouter<UserState>
where
	UserState: Clone + Send + Sync + 'static,
{
	type State = UserState;

	fn path(url_path: impl HttpRouteIDInterface + fmt::Debug) -> Self
	{
		Self {
			name: format!("{url_path:?}"),
			fullpath: url_path.path().to_string(),
			methods: Default::default(),
			action: Default::default(),
		}
	}

	fn any<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = axum::routing::any(action);
		self.methods.extend([
			http::Method::DELETE,
			http::Method::GET,
			http::Method::HEAD,
			http::Method::OPTIONS,
			http::Method::PATCH,
			http::Method::POST,
			http::Method::PUT,
			http::Method::TRACE,
		]);
		self
	}

	fn delete<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.delete(action);
		self.methods.insert(http::Method::DELETE);
		self
	}

	fn get<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.get(action);
		self.methods.insert(http::Method::GET);
		self
	}

	fn head<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.head(action);
		self.methods.insert(http::Method::HEAD);
		self
	}

	fn options<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.options(action);
		self.methods.insert(http::Method::OPTIONS);
		self
	}

	fn patch<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.patch(action);
		self.methods.insert(http::Method::PATCH);
		self
	}

	fn post<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.post(action);
		self.methods.insert(http::Method::POST);
		self
	}

	fn put<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.put(action);
		self.methods.insert(http::Method::PUT);
		self
	}

	fn trace<Action, ActionType>(mut self, action: Action) -> Self
	where
		Action: axum::handler::Handler<ActionType, AxumState<Self::State>>,
		ActionType: 'static,
	{
		self.action = self.action.trace(action);
		self.methods.insert(http::Method::TRACE);
		self
	}

	fn middleware<L>(mut self, layer: L) -> Self
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
	{
		self.action = self.action.route_layer(layer);
		self
	}

	fn build(self) -> HttpRouter<Self::State>
	{
		self
	}
}

impl<S> From<&HttpRouter<S>> for axum::Router<AxumState<S>>
where
	S: Clone + Send + Sync + 'static,
{
	fn from(router: &HttpRouter<S>) -> Self
	{
		let mut r = Self::new();

		let full_path = &router.fullpath;
		let full_path_trimmed = router.fullpath.trim_end_matches('/');

		if full_path.len() != full_path_trimmed.len() {
			r = r.route(full_path_trimmed, router.action.to_owned())
		}

		r.route(full_path, router.action.to_owned())
	}
}
