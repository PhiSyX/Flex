/*
 * Any copyright is dedicated to the Public Domain.
 * https://creativecommons.org/publicdomain/zero/1.0/
 */

mod external_crate;

use external_crate::AnyApplicationAdapter;
use flex_kernel::{ApplicationLoggerInterface, ApplicationStartupExtension};

// -------- //
// Constant //
// -------- //

const APPLICATION_NAME: &'static str = "flex-app";
const APPLICATION_VERSION: &'static str = env!("CARGO_PKG_VERSION");
const APPLICATION_ROOT_DIR: &'static str = env!("CARGO_MANIFEST_DIR");

// ---- //
// Main //
// ---- //

fn main()
{
	type Application = flex_kernel::Kernel<AnyApplicationAdapter>;

	let application = Application::new(APPLICATION_NAME,APPLICATION_VERSION, APPLICATION_ROOT_DIR)
		// NOTE: Initialise le logger avec des paramètres par défaut ou récupéré
		// 		 depuis le fichier de configuration du logger.
		.initialize_logger()
		// NOTE: Initialise le logger avec les paramètres utilisateurs.
		// .with_logger(
		// 	flex_kernel::settings::LoggerSettings {
		// 		preset: flex_kernel::settings::LoggerSettingsPreset::Default,
		// 		target_filters: vec![String::from("logger")],
		// 		..Default::default()
		// 	},
		// )
	;

	log::info!("My Best Logger");

	application.run();
}
