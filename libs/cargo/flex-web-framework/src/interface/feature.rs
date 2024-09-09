// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::settings::Config;
use crate::{AxumRouter, AxumState, RouterInterface};

// --------- //
// Interface //
// --------- //

/// Interface d'application Feature
pub trait ApplicationFeatureInterface<UserState>
{
	/// Applique une feature au serveur.
	fn feature<F>(self) -> Self
	where
		F: Feature<State = UserState>;

	/// Applique une feature WebSocket au serveur.
	fn feature_ws<F>(self) -> Self
	where
		F: WebSocketFeature<UserState>;
}

/// Interface d'application Feature dans un contexte asynchrone.
pub trait AsyncApplicationFeatureInterface<UserState>
{
	/// Applique une feature asynchrone au serveur.
	async fn feature<F>(self) -> Self
	where
		F: AsyncFeature<State = UserState>;

	/// Applique une feature WebSocket asynchrone au serveur.
	async fn feature_ws<F>(self) -> Self
	where
		F: WebSocketAsyncFeature<UserState>;
}

// --------- //
// Interface //
// --------- //

pub trait Feature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface<Self::State>;

	/// L'état de l'application.
	type State;

	/// Le nom de la feature.
	const NAME: &'static str;

	fn register_services(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_extensions(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_layers(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	fn register_middlewares(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}
}

pub trait AsyncFeature
{
	/// La configuration de la feature.
	type Config: FeatureConfig;

	/// Les routeurs de la feature.
	type Router: RouterInterface<Self::State>;

	/// L'état de l'application.
	type State;

	/// Le nom de la feature.
	const NAME: &'static str;

	async fn register_services(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_extensions(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_layers(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}

	async fn register_middlewares(
		_config: &Config<Self::Config>,
		_state: &mut AxumState<Self::State>,
		router: AxumRouter<Self::State>,
	) -> AxumRouter<Self::State>
	{
		router
	}
}

pub trait WebSocketFeature<UserState>: Feature<State = UserState>
{
	#[rustfmt::skip]
	type Auth
		: 'static
		+ Send + Sync
		+ serde::de::DeserializeOwned
		;

	/// L'état de la feature WebSocket.
	#[rustfmt::skip]
	type State
		: 'static
		+ Send + Sync
		+ Default
		;

	/// Point d'entrée racine de la WebSocket.
	const ENDPOINT: &'static str;

	fn on_connect(
		socket: socketioxide::extract::SocketRef,
		server_state: socketioxide::extract::State<AxumState<UserState>>,
		user_state: socketioxide::extract::State<
			<Self as WebSocketFeature<UserState>>::State,
		>,
		auth_data: socketioxide::extract::TryData<Self::Auth>,
	);
}

pub trait WebSocketAsyncFeature<UserState>:
	AsyncFeature<State = UserState>
{
	#[rustfmt::skip]
	type Auth
		: 'static
		+ Send + Sync
		+ serde::de::DeserializeOwned
		;

	/// L'état de la feature WebSocket.
	#[rustfmt::skip]
	type State
		: 'static
		+ Send + Sync
		+ Default
		;

	/// Point d'entrée racine de la WebSocket.
	const ENDPOINT: &'static str;

	fn on_connect(
		socket: socketioxide::extract::SocketRef,
		server_state: socketioxide::extract::State<AxumState<UserState>>,
		user_state: socketioxide::extract::State<
			<Self as WebSocketAsyncFeature<UserState>>::State,
		>,
		auth_data: socketioxide::extract::TryData<Self::Auth>,
	);
}

pub trait FeatureConfig:
	'static + Send + Sync + Clone + std::fmt::Debug + serde::de::DeserializeOwned
{
	/// Nom du fichier de configuration de la feature à dé-sérialiser.
	///
	/// Le fichier DOIT se trouver dans le répertoire de configuration de
	/// l'application.
	const FILENAME: &'static str;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FeatureConfig for ()
{
	const FILENAME: &'static str = "empty";
}

impl<U> FeatureConfig for Config<U>
where
	U: FeatureConfig,
{
	const FILENAME: &'static str = U::FILENAME;
}
