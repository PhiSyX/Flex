// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::sync::Arc;

use flex_kernel::settings::KernelSettings;
use flex_kernel::{UserApplicationEnvInterface, process};
use flex_web_framework::types::{secret, url};

// --------- //
// Structure //
// --------- //

/// Les variables d'environnement du serveur de Chat.
#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct FlexEnv
{
	/// Clé secrete d'application.
	pub app_secret: secret::Secret<Arc<str>>,
	/// URL de connexion à une base de données.
	pub database_url: secret::Secret<url::Url>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl UserApplicationEnvInterface for FlexEnv
{
	const FILENAME: &'static str = ".env";

	fn with_suffix(settings: &KernelSettings) -> impl ToString
	{
		match settings.process_mode {
			| process::ProcessMode::LOCAL => "",
			| process::ProcessMode::DEVELOPMENT => ".dev",
			| process::ProcessMode::PRODUCTION => ".prod",
			| process::ProcessMode::TEST => ".test",
		}
	}
}
