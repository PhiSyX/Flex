// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{JsonRpcRouter, JsonRpcRouterBuilder};

// --------- //
// Structure //
// --------- //

pub struct JsonRpcHandlerCollection<UserState>
{
	pub(crate) global: axum::Router<()>,
	routers: Vec<JsonRpcRouter<UserState>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<S> JsonRpcHandlerCollection<S>
{
	/// Ajoute un router à la liste des routeurs.
	#[allow(clippy::should_implement_trait)]
	pub fn add(mut self, builder: impl JsonRpcRouterBuilder<State = S>) -> Self
	{
		let route = builder.build();
		self.routers.push(route);
		self
	}
}

impl<S> JsonRpcHandlerCollection<S>
{
	/// Liste les routeurs.
	pub fn all(&self) -> impl Iterator<Item = &JsonRpcRouter<S>> + '_
	{
		self.routers.iter()
	}

	pub fn all_owned(self) -> impl IntoIterator<Item = JsonRpcRouter<S>>
	{
		self.routers.into_iter()
	}

	/// Extension d'un routeur vers celui-ci.
	pub fn extends(&mut self, other: Self)
	{
		self.routers.extend(other.routers);
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> Default for JsonRpcHandlerCollection<S>
{
	fn default() -> Self
	{
		Self {
			global: Default::default(),
			routers: Default::default(),
		}
	}
}
