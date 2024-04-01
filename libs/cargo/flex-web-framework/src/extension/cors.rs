// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use tower_http::cors::CorsLayer;

use crate::settings::CORSSettings;
use crate::AxumApplication;

// --------- //
// Interface //
// --------- //

/// Extension d'application "CORS Layer"
pub trait ApplicationCorsLayerExtension
	: Sized
{
	/// Applique un layer CORS au serveur.
	fn use_cors_layer(self) -> Self;
}

// -------------- //
// Implémentation //
// -------------- //

impl<S, E, C> ApplicationCorsLayerExtension for AxumApplication<S, E, C>
{
	fn use_cors_layer(mut self) -> Self
	{
		let cors_settings = match self.fetch_config::<CORSSettings>(CORSSettings::FILENAME) {
			| Ok(s) => s,
			| Err(err) => self.signal().send_critical(format!("Erreur liée au CORS : {err}")),
		};

		log::debug!("Paramètres CORS: {:#?}", &cors_settings);

		let cors_layer: CorsLayer = cors_settings.into();
		self.application_adapter.router.global = self.application_adapter.router.global.layer(cors_layer);

		self
	}
}
