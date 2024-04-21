// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use console::style;
use tower_http::cors::CorsLayer;

use crate::{settings::Config, AxumApplication, AxumRouter, AxumState, RouterInterface};

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

impl<S, E, C> ApplicationFeatureInterface<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	#[rustfmt::skip]
	fn feature<F>(mut self) -> Self
	where
		F: Feature<State = S>,
	{
		self.application_adapter.state.set_server_settings(
			self.application_adapter.settings.clone()
		);

		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<F::State>>::routes(
			&self.application_adapter.state,
		);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as Feature>::Config> = match self.fetch_config(
			config_filename
		) {
			| Ok(c) => c,
			| Err(err) => {
				let err_s = if config_filename == "empty" {
					format!(
						"LIMITATION: un fichier « {}/{}.{} » DOIT être crée.",
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
					)
				} else {
					format!(
						"Le fichier de configuration de la feature « {} » n'a \
						 pas pu être chargé. \nFichier: « {}/{}.{} » \
						 \nRaison: « {} »",
						F::NAME,
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
						err
					)
				};
				self.signal().send_critical(err_s);
			}
		};

		if let Some(cookie) = config.cookie.as_ref() {
			self.application_adapter.state.set_cookie_settings(cookie.clone());
		}

		scoped_router = F::register_services(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!(
				"Application de la feature « {} »",
				style(F::NAME).yellow(),
			);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« \
				 {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(
			scoped_router.with_state(self.application_adapter.state.clone()),
		);
		self.application_adapter.router.extends(router_collection);

		self
	}

	fn feature_ws<F>(mut self) -> Self
	where
		F: WebSocketFeature<S>,
	{
		self.application_adapter
			.state
			.set_server_settings(self.application_adapter.settings.clone());

		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<
			<F as Feature>::State,
		>>::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as Feature>::Config> = match self
			.fetch_config(config_filename)
		{
			| Ok(c) => c,
			| Err(err) => {
				let err_s = if config_filename == "empty" {
					format!(
						"LIMITATION: un fichier « {}/{}.{} » DOIT être crée.",
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
					)
				} else {
					format!(
						"Le fichier de configuration de la feature « {} » n'a \
						 pas pu être chargé. \nFichier: « {}/{}.{} » \
						 \nRaison: « {} »",
						F::NAME,
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
						err
					)
				};
				self.signal().send_critical(err_s);
			}
		};

		if let Some(cookie) = config.cookie.as_ref() {
			self.application_adapter
				.state
				.set_cookie_settings(cookie.clone());
		}

		scoped_router = F::register_services(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		);

		let (layer, io) = socketioxide::SocketIo::builder()
			.with_state(self.application_adapter.state.clone())
			.with_state(<F as WebSocketFeature<S>>::State::default())
			.build_layer();

		io.ns(
			F::ENDPOINT,
			|socket: socketioxide::extract::SocketRef,
			 server_state: socketioxide::extract::State<AxumState<S>>,
			 user_state: socketioxide::extract::State<
				<F as WebSocketFeature<S>>::State,
			>,
			 auth_data: socketioxide::extract::TryData<F::Auth>| {
				F::on_connect(socket, server_state, user_state, auth_data);
			},
		);

		self.application_adapter.state.set_ws(io);

		scoped_router = scoped_router.layer(layer);

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!(
				"Application de la feature « {} »",
				style(F::NAME).yellow(),
			);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« \
				 {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(
			scoped_router.with_state(self.application_adapter.state.clone()),
		);
		self.application_adapter.router.extends(router_collection);

		self
	}
}

impl<S, E, C> AsyncApplicationFeatureInterface<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	#[rustfmt::skip]
	async fn feature<F>(mut self) -> Self
	where
		F: AsyncFeature<State = S>,
	{
		self.application_adapter.state.set_server_settings(
			self.application_adapter.settings.clone()
		);

		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<F::State>>::routes(
			&self.application_adapter.state,
		);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as AsyncFeature>::Config> = match self.fetch_config(
			config_filename
		) {
			| Ok(c) => c,
			| Err(err) => {
				let err_s = if config_filename == "empty" {
					format!(
						"LIMITATION: un fichier « {}/{}.{} » DOIT être crée.",
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
					)
				} else {
					format!(
						"Le fichier de configuration de la feature « {} » n'a \
						 pas pu être chargé. \nFichier: « {}/{}.{} » \
						 \nRaison: « {} »",
						F::NAME,
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
						err
					)
				};
				self.signal().send_critical(err_s);
			}
		};

		if let Some(cookie) = config.cookie.as_ref() {
			self.application_adapter.state.set_cookie_settings(cookie.clone());
		}

		scoped_router = F::register_services(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!(
				"Application de la feature « {} »",
				style(F::NAME).yellow(),
			);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« \
				 {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(
			scoped_router.with_state(self.application_adapter.state.clone()),
		);
		self.application_adapter.router.extends(router_collection);

		self
	}

	#[rustfmt::skip]
	async fn feature_ws<F>(mut self) -> Self
	where
		F: WebSocketAsyncFeature<S>,
	{
		self.application_adapter.state.set_server_settings(
			self.application_adapter.settings.clone()
		);

		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<<F as AsyncFeature>::State>>::routes(
			&self.application_adapter.state,
		);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as AsyncFeature>::Config> = match self.fetch_config(
			config_filename
		) {
			| Ok(c) => c,
			| Err(err) => {
				let err_s = if config_filename == "empty" {
					format!(
						"LIMITATION: un fichier « {}/{}.{} » DOIT être crée.",
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
					)
				} else {
					format!(
						"Le fichier de configuration de la feature « {} » n'a \
						 pas pu être chargé. \nFichier: « {}/{}.{} » \
						 \nRaison: « {} »",
						F::NAME,
						self.settings.directory.config_sudo().display(),
						config_filename,
						self.settings.loader_extension,
						err
					)
				};
				self.signal().send_critical(err_s);
			}
		};

		if let Some(cookie) = config.cookie.as_ref() {
			self.application_adapter.state.set_cookie_settings(cookie.clone());
		}

		scoped_router = F::register_services(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		).await;

		let (layer, io) = socketioxide::SocketIo::builder()
			.with_state(self.application_adapter.state.clone())
			.with_state(<F as WebSocketAsyncFeature<S>>::State::default())
			.build_layer();

		io.ns(
			F::ENDPOINT,
			|
				socket: socketioxide::extract::SocketRef,
				server_state: socketioxide::extract::State<AxumState<S>>,
				user_state: socketioxide::extract::State<<F as WebSocketAsyncFeature<S>>::State>,
				auth_data: socketioxide::extract::TryData<F::Auth>,
			| {
				F::on_connect(socket, server_state, user_state, auth_data);
			}
		);

		self.application_adapter.state.set_ws(io);

		scoped_router = scoped_router.layer(layer);

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!(
				"Application de la feature « {} »",
				style(F::NAME).yellow(),
			);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« \
				 {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(
			scoped_router.with_state(self.application_adapter.state.clone()),
		);
		self.application_adapter.router.extends(router_collection);

		self
	}
}
