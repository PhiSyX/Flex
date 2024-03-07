// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use super::{Router, RouterBuilder};
use crate::AxumState;

// --------- //
// Structure //
// --------- //

#[derive(Default)]
pub struct RouterCollection
{
	pub(crate) global: axum::Router<()>,
	routers: Vec<Router<AxumState>>,
}

// -------------- //
// Implémentation //
// -------------- //

impl RouterCollection
{
	/// Ajoute un router à la liste des routeurs.
	#[allow(clippy::should_implement_trait)]
	pub fn add(mut self, builder: impl RouterBuilder) -> Self
	{
		self.routers.push(builder.build());
		self
	}

	/// Liste les routeurs.
	pub fn all(&self) -> impl Iterator<Item = &Router<AxumState>>
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
