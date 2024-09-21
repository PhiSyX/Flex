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
use socketioxide::{extract, SocketIo};
use time::Duration;
use tower_http::cors::CorsLayer;
use tower_sessions::{Expiry, MemoryStore, SessionManagerLayer};

use crate::http::routing::HttpRouterInterface;
use crate::json_rpc::routing::JsonRpcHandlersInterface;
use crate::{
	server,
	ApplicationCookieLayerInterface,
	ApplicationCorsLayerInterface,
	ApplicationExtensionInterface,
	ApplicationFeatureInterface,
	ApplicationStateInterface,
	AsyncApplicationExtensionInterface,
	AsyncApplicationFeatureInterface,
	AsyncExtensionInterface,
	AsyncFeature,
	AxumState,
	CORSSettings,
	Config,
	ExtensionInterface,
	Feature,
	FeatureConfig,
	JsonRpcFeature,
	WebSocketAsyncFeature,
	WebSocketFeature,
	WebSocketHandlers2Interface,
	WebSocketHandlersInterface,
};

// ---- //
// Type //
// ---- //

pub type AxumApplication<S = (), E = (), C = ()> =
	flex_kernel::Kernel<server::Server<S, E, C>, E, C>;
pub type AxumRouter<S> = axum::Router<AxumState<S>>;

// -------------- //
// Implémentation // -> /interface
// -------------- //

impl<S, E, C> ApplicationCookieLayerInterface for AxumApplication<S, E, C>
where
	S: Clone,
{
	fn define_cookie_key(
		mut self,
		key: impl TryInto<tower_cookies::Key>,
	) -> Self
	{
		let Ok(cookie_key) = key.try_into() else {
			let reason = "La clé de cookie reçue lors de l'initialisation de \
			              l'application est incorrecte.";
			self.signal().send_critical(reason);
		};
		self.application_adapter.state.set_cookie_key(cookie_key);
		self
	}

	fn use_cookie_layer(mut self) -> Self
	{
		if self.application_adapter.state.cookie_key().is_none() {
			let reason = "Vous devez définir une clé de cookie avec \
			              YourApp#define_cookie_key avant d'utiliser le layer \
			              de cookie";
			self.signal().send_critical(reason);
		};

		let cookie_settings =
			self.application_adapter.state.clone().cookie_settings();

		let session_store = MemoryStore::default();
		let mut session_layer = SessionManagerLayer::new(session_store)
			.with_name("flex.session")
			.with_path(cookie_settings.path);

		if let Some(domain) = cookie_settings.domain {
			session_layer = session_layer.with_domain(domain);
		}
		if let Some(b) = cookie_settings.http_only {
			session_layer = session_layer.with_http_only(b);
		}
		if let Some(secs) = cookie_settings.max_age {
			session_layer = session_layer
				.with_expiry(Expiry::OnInactivity(Duration::seconds(secs)));
		}
		if let Some(b) = cookie_settings.secure {
			session_layer = session_layer.with_secure(b);
		}
		if let Some(sm) = cookie_settings.same_site {
			session_layer = session_layer.with_same_site(sm.into());
		}

		self.application_adapter.router.global = self
			.application_adapter
			.router
			.global
			.layer(session_layer)
			.layer(tower_cookies::CookieManagerLayer::new());

		self
	}
}

impl<S, E, C> ApplicationCorsLayerInterface for AxumApplication<S, E, C>
{
	fn use_cors_layer(mut self) -> Self
	{
		let cors_settings: CORSSettings =
			match self.fetch_config(CORSSettings::FILENAME) {
				| Ok(s) => s,
				| Err(err) => {
					self.signal()
						.send_critical(format!("Erreur liée au CORS : {err}"))
				}
			};

		log::debug!("Paramètres CORS: {:#?}", &cors_settings);

		let cors_layer: CorsLayer = cors_settings.into();
		self.application_adapter.router.global =
			self.application_adapter.router.global.layer(cors_layer);

		self
	}
}

impl<S, E, C> ApplicationExtensionInterface for AxumApplication<S, E, C>
{
	fn extension<Ext>(self) -> Self
	where
		Ext: ExtensionInterface<Payload = ()>,
	{
		<Self as ApplicationExtensionInterface>::extension_with::<Ext>(self, ())
	}

	fn extension_with<Ext>(mut self, payload: impl Into<Ext::Payload>) -> Self
	where
		Ext: ExtensionInterface,
	{
		let payload = payload.into();
		let instance = Ext::new(payload);
		self.application_adapter.router.global = self
			.application_adapter
			.router
			.global
			.layer(axum::Extension(instance));
		self
	}
}

impl<S, E, C> AsyncApplicationExtensionInterface for AxumApplication<S, E, C>
{
	async fn extension<Ext>(self) -> Self
	where
		Ext: AsyncExtensionInterface<Payload = ()>,
	{
		<Self as AsyncApplicationExtensionInterface>::extension_with::<Ext>(
			self,
			(),
		)
		.await
	}

	async fn extension_with<Ex>(
		mut self,
		payload: impl Into<Ex::Payload>,
	) -> Self
	where
		Ex: AsyncExtensionInterface,
	{
		let payload = payload.into();
		let instance = Ex::new(payload).await;
		self.application_adapter.router.global = self
			.application_adapter
			.router
			.global
			.layer(axum::Extension(instance));
		self
	}
}

impl<S, E, C> ApplicationFeatureInterface<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	fn feature<F>(mut self) -> Self
	where
		F: Feature<State = S>,
	{
		self.application_adapter
			.state
			.set_server_settings(self.application_adapter.settings.clone());

		let config_filename = F::Config::FILENAME;

		let router_collection =
			F::Router::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<F::Config> = match self.fetch_config(config_filename)
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

		let config_filename = F::Config::FILENAME;

		let router_collection =
			F::Router::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<F::Config> = match self.fetch_config(config_filename)
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

		let (layer, io) = SocketIo::builder()
			.with_state(self.application_adapter.state.clone())
			.with_state(<F as WebSocketFeature<S>>::State::default())
			.req_path(F::ENDPOINT)
			.build_layer();

		io.ns(
			"/",
			|socket: extract::SocketRef,
			 server_state: extract::State<AxumState<S>>,
			 user_state: extract::State<<F as WebSocketFeature<S>>::State>,
			 auth_data: extract::TryData<F::Auth>| {
				F::Handlers::listen(&socket);
				F::Handlers2::listen(&socket);
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

	fn feature_json_rpc<F>(mut self) -> Self
	where
		F: JsonRpcFeature<S>,
	{
		let handlers = F::Handlers::handlers(&self.application_adapter.state);

		let mut rpc_router = rpc_router::Router::builder();
		for handler in handlers.all_owned() {
			let rpc_route_builder = rpc_router::RouterBuilder::default()
				.append_dyn(handler.name.leak(), handler.action);
			rpc_router = rpc_router.extend(rpc_route_builder);
		}

		self.application_adapter
			.state
			.set_json_rpc(rpc_router.build());

		let scoped_router = axum::Router::<AxumState<S>>::new().route(
			F::ENDPOINT,
			axum::routing::post(crate::json_rpc::JsonRpcHandler::handle),
		);

		self.application_adapter.router.merge(
			scoped_router.with_state(self.application_adapter.state.clone()),
		);

		self
	}
}

impl<S, E, C> AsyncApplicationFeatureInterface<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	async fn feature<F>(mut self) -> Self
	where
		F: AsyncFeature<State = S>,
	{
		self.application_adapter
			.state
			.set_server_settings(self.application_adapter.settings.clone());

		let config_filename = F::Config::FILENAME;

		let router_collection =
			F::Router::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<F::Config> = match self.fetch_config(config_filename)
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
		)
		.await;
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;

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

	async fn feature_ws<F>(mut self) -> Self
	where
		F: WebSocketAsyncFeature<S>,
	{
		self.application_adapter
			.state
			.set_server_settings(self.application_adapter.settings.clone());

		let config_filename = F::Config::FILENAME;

		let router_collection =
			F::Router::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<F::Config> = match self.fetch_config(config_filename)
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
		)
		.await;
		scoped_router = F::register_extensions(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;
		scoped_router = F::register_layers(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;
		scoped_router = F::register_middlewares(
			&config,
			&mut self.application_adapter.state,
			scoped_router,
		)
		.await;

		let (layer, io) = SocketIo::builder()
			.with_state(self.application_adapter.state.clone())
			.with_state(<F as WebSocketAsyncFeature<S>>::State::default())
			.req_path(F::ENDPOINT)
			.build_layer();

		io.ns(
			"/",
			|socket: extract::SocketRef,
			 server_state: extract::State<AxumState<S>>,
			 user_state: extract::State<
				<F as WebSocketAsyncFeature<S>>::State,
			>,
			 auth_data: extract::TryData<F::Auth>| {
				F::Handlers::listen(&socket);
				F::Handlers2::listen(&socket);
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

impl<S, E, C> ApplicationStateInterface<S> for AxumApplication<S, E, C>
{
	fn define_default_state(mut self, state: S) -> Self
	{
		self.application_adapter =
			self.application_adapter.define_default_state(state);
		self
	}
}
