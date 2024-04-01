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

use crate::settings::Config;
use crate::{AsyncFeature, AxumApplication, AxumState, Feature, FeatureConfig, RouterInterface};

// --------- //
// Interface //
// --------- //

/// Extension d'application Feature
pub trait ApplicationFeatureExtension<UserState>
	: Sized
{
	/// Applique une feature au serveur.
	fn feature<F>(self) -> Self where F: Feature<State = UserState>;
}

/// Extension d'application Feature dans un contexte asynchrone.
pub trait AsyncApplicationFeatureExtension<UserState>
	: Sized
{
	/// Applique une feature asynchrone au serveur.
	async fn feature<F>(self) -> Self where F: AsyncFeature<State = UserState>;
}

// -------------- //
// Implémentation //
// -------------- //

impl<U> FeatureConfig for Config<U>
where
	U: FeatureConfig,
{
	const FILENAME: &'static str = U::FILENAME;
}

impl<S, E, C> ApplicationFeatureExtension<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	fn feature<F>(mut self) -> Self where F: Feature<State = S>,
	{
		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<F::State>>::routes(
			&self.application_adapter.state
		);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as Feature>::Config> = match self.fetch_config(config_filename) {
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
						"Le fichier de configuration de la feature « {} » n'a pas pu être chargé. \
						 \nFichier: « {}/{}.{} » \nRaison: « {} »",
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

		scoped_router = F::register_services(&config, &mut self.application_adapter.state, scoped_router);
		scoped_router = F::register_extensions(&config, &mut self.application_adapter.state, scoped_router);
		scoped_router = F::register_layers(&config, &mut self.application_adapter.state, scoped_router);
		scoped_router = F::register_middlewares(&config, &mut self.application_adapter.state, scoped_router);

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!("Application de la feature « {} »", style(F::NAME).yellow(),);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(scoped_router.with_state(self.application_adapter.state.clone()));
		self.application_adapter.router.extends(router_collection);

		self
	}
}

impl<S, E, C> AsyncApplicationFeatureExtension<S> for AxumApplication<S, E, C>
where
	S: 'static,
	S: Clone,
	S: Send + Sync,
{
	async fn feature<F>(mut self) -> Self where F: AsyncFeature<State = S>,
	{
		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface<F::State>>::routes(&self.application_adapter.state);

		let mut scoped_router = axum::Router::<AxumState<S>>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config: Config<<F as AsyncFeature>::Config> = match self.fetch_config(config_filename) {
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
						"Le fichier de configuration de la feature « {} » n'a pas pu être chargé. \
						 \nFichier: « {}/{}.{} » \nRaison: « {} »",
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

		scoped_router = F::register_services(&config, &mut self.application_adapter.state, scoped_router).await;
		scoped_router = F::register_extensions(&config, &mut self.application_adapter.state, scoped_router).await;
		scoped_router = F::register_layers(&config, &mut self.application_adapter.state, scoped_router).await;
		scoped_router = F::register_middlewares(&config, &mut self.application_adapter.state, scoped_router).await;

		if let Some(cors) = config.cors.as_ref() {
			let cors_layer: CorsLayer = cors.into();
			scoped_router = scoped_router.layer(cors_layer);
		}

		if config_filename == "empty" {
			log::info!("Application de la feature « {} »", style(F::NAME).yellow(),);
		} else {
			log::debug!(
				"Application de la feature « {} » avec la configuration: \n« {:#?} »",
				style(F::NAME).yellow(),
				&config.user
			);

			scoped_router = scoped_router.layer(axum::Extension(config.user));
		}

		self.application_adapter.router.merge(scoped_router.with_state(self.application_adapter.state.clone()));
		self.application_adapter.router.extends(router_collection);

		self
	}
}
