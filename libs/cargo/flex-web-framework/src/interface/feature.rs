// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::RouterInterface;

// --------- //
// Interface //
// --------- //

pub trait Feature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface;

	/// Le nom de la feature.
	const NAME: &'static str;

	fn register_services(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	fn register_extensions(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	fn register_layers(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	fn register_middlewares(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}
}

#[allow(async_fn_in_trait)]
pub trait AsyncFeature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface;

	/// Le nom de la feature.
	const NAME: &'static str;

	async fn register_services(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	async fn register_extensions(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	async fn register_layers(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}

	async fn register_middlewares(
		_config: &crate::settings::Config<Self::Config>,
		_state: &crate::AxumApplicationState,
		router: crate::Router<crate::AxumApplicationState>,
	) -> crate::Router<crate::AxumApplicationState>
	{
		router
	}
}

pub trait FeatureConfig:
	Clone + std::fmt::Debug + Send + Sync + 'static + serde::de::DeserializeOwned
{
	/// Nom du fichier de configuration de la feature à dé-sérialiser.
	///
	/// Le fichier DOIT se trouver dans le répertoire de configuration de
	/// l'application.
	const FILENAME: &'static str;
}

// -------------- //
// Implémentation //
// -------------- //

impl FeatureConfig for ()
{
	const FILENAME: &'static str = "empty";
}
