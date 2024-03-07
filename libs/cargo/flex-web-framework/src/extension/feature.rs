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
pub trait ApplicationFeatureExtension: Sized
{
	/// Applique une feature au serveur.
	fn feature<F>(self) -> Self
	where
		F: Feature;
}

/// Extension d'application Feature dans un contexte asynchrone.
pub trait AsyncApplicationFeatureExtension: Sized
{
	/// Applique une feature asynchrone au serveur.
	#[allow(async_fn_in_trait)]
	async fn feature<F>(self) -> Self
	where
		F: AsyncFeature;
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

impl<E, C> ApplicationFeatureExtension for AxumApplication<E, C>
{
	fn feature<F>(mut self) -> Self
	where
		F: Feature,
	{
		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface>::routes();

		let mut scoped_router = axum::Router::<AxumState>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config = match self.fetch_config(config_filename) {
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

		let state = &self.application_adapter.state;
		scoped_router = F::register_services(&config, state, scoped_router);
		scoped_router = F::register_extensions(&config, state, scoped_router);
		scoped_router = F::register_layers(&config, state, scoped_router);
		scoped_router = F::register_middlewares(&config, state, scoped_router);

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

		self.application_adapter
			.router
			.merge(scoped_router.with_state(state.clone()));
		self.application_adapter.router.extends(router_collection);

		self
	}
}

impl<E, C> AsyncApplicationFeatureExtension for AxumApplication<E, C>
{
	async fn feature<F>(mut self) -> Self
	where
		F: AsyncFeature,
	{
		let config_filename = <F::Config as FeatureConfig>::FILENAME;

		let router_collection = <F::Router as RouterInterface>::routes();

		let mut scoped_router = axum::Router::<AxumState>::new();

		for router in router_collection.all() {
			scoped_router = scoped_router.merge(router);
		}

		let config = match self.fetch_config(config_filename) {
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

		let state = &self.application_adapter.state;
		scoped_router = F::register_services(&config, state, scoped_router).await;
		scoped_router = F::register_extensions(&config, state, scoped_router).await;
		scoped_router = F::register_layers(&config, state, scoped_router).await;
		scoped_router = F::register_middlewares(&config, state, scoped_router).await;

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

		self.application_adapter
			.router
			.merge(scoped_router.with_state(state.clone()));
		self.application_adapter.router.extends(router_collection);

		self
	}
}
