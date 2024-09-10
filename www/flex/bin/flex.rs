// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::process;

use flex_kernel::{
	ApplicationCLIInterface,
	ApplicationEnvInterface,
	ApplicationLoggerInterface,
	AsyncApplicationStartupExtension,
};
use flex_web_framework::security::Argon2Password;
use flex_web_framework::{
	ApplicationCookieLayerInterface,
	ApplicationStateInterface,
	DatabaseService,
	PostgreSQLDatabase,
};
use lib_flex::constant::{
	FLEX_CONFIGURATION_DIR,
	FLEX_ENV_VARS_DIR,
	FLEX_NAME,
	FLEX_ROOT_DIR,
	FLEX_VERSION,
	PROJECT_DIR,
};
use lib_flex::{
	AccountsApplication,
	AuthApplication,
	AvatarsApplication,
	ChatApplication,
	Flex,
	GenerateApplication,
	UsersApplication,
};

// ---- //
// Main //
// ---- //

#[tokio::main]
async fn main() -> impl process::Termination
{
	let application = Flex::new(FLEX_NAME, FLEX_VERSION, FLEX_ROOT_DIR);

	// 1. Setup
	let application = application
		.define_project_directory(PROJECT_DIR)
		.define_config_directory(FLEX_CONFIGURATION_DIR)
		.define_env_directory(FLEX_ENV_VARS_DIR)
		.initialize_logger()
	;

	let application = application.include_env_vars().include_cli_args();

	if application.cli_args().has_command() {
		application.cli_args().handle_command();
		return process::ExitCode::SUCCESS;
	}

	let app_secret_key = application.env().app_secret.expose().to_owned();

	let application = {
		// NOTE: Les features peuvent avoir besoin de cette clé. Cette clé est
		//       sauvegardée dans un état, sauf que cet état est "cloné" au
		//       moment où nous définissons la feature.
		application.define_cookie_key(app_secret_key.as_bytes())
	};

	// 2. Features / Async Features
	let application = {
		use flex_web_framework::ApplicationFeatureInterface;
		application
			.define_default_state(lib_flex::FlexState::Initial)
			.feature::<GenerateApplication>()
			.feature::<AuthApplication>()
			.feature::<UsersApplication>()
			.feature::<AccountsApplication>()
			.feature::<AvatarsApplication>()
			.feature_ws::<ChatApplication>()
	};

	// 3. Layers, extensions, services
	let application = {
		use flex_web_framework::ApplicationExtensionInterface;
		application
			.use_cookie_layer()
			.extension_with::<Argon2Password>(app_secret_key)
	};

	// 3.1. Layers, extensions, services (Async)
	#[rustfmt::skip]
	let application = {
		use flex_web_framework::AsyncApplicationExtensionInterface;
		let database_url = application.env().database_url.expose().to_owned();
		application.extension_with::<DatabaseService<PostgreSQLDatabase>>(
			database_url,
		).await
	};

	// 4. Run
	application.run().await;

	return process::ExitCode::SUCCESS;
}
