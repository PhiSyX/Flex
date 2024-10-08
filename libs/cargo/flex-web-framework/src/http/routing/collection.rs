// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{HttpRouter, HttpRouterBuilder};

// --------- //
// Structure //
// --------- //

pub struct HttpRouterCollection<S>
{
	pub(crate) global: axum::Router<()>,
	routers: Vec<HttpRouter<S>>,
	group: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl<S> HttpRouterCollection<S>
{
	/// Préfixe les URL's des routes par le nom donné.
	pub fn with_group(mut self, name: impl ToString) -> Self
	{
		self.group = name.to_string();
		self
	}

	/// Ajoute un router à la liste des routeurs.
	#[allow(clippy::should_implement_trait)]
	pub fn add(mut self, builder: impl HttpRouterBuilder<State = S>) -> Self
	{
		let mut route = builder.build();
		route.fullpath = format!("{}{}", self.group, route.fullpath);
		self.routers.push(route);
		self
	}
}

impl<S> HttpRouterCollection<S>
{
	/// Liste les routeurs.
	pub fn all(&self) -> impl Iterator<Item = &HttpRouter<S>>
	{
		self.routers.iter()
	}

	/// Routeur global.
	pub fn global(self) -> axum::Router<()>
	{
		self.global
	}

	/// Extension d'un routeur vers celui-ci.
	pub fn extends(&mut self, other: Self)
	{
		self.routers.extend(other.routers);
	}

	/// Extension d'un routeur Axum vers le routeur axum global.
	pub fn merge(&mut self, axum_router: axum::Router<()>)
	{
		self.global = self.global.clone().merge(axum_router);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> Default for HttpRouterCollection<S>
{
	fn default() -> Self
	{
		HttpRouterCollection {
			global: Default::default(),
			routers: Default::default(),
			group: Default::default(),
		}
	}
}
