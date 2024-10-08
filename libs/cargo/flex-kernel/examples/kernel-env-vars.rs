/*
 * Any copyright is dedicated to the Public Domain.
 * https://creativecommons.org/publicdomain/zero/1.0/
 */

mod external_crate;

use external_crate::AnyApplicationAdapter;
use flex_kernel::{
	ApplicationAdapterEnvInterface,
	ApplicationEnvInterface,
	ApplicationStartupExtension,
	UserApplicationEnvInterface,
};

// ---- //
// Type //
// ---- //

type Application =
	flex_kernel::Kernel<AnyApplicationAdapter<ApplicationEnv>, ApplicationEnv>;

// -------- //
// Constant //
// -------- //

const APPLICATION_NAME: &str = "flex-app";
const APPLICATION_VERSION: &str = env!("CARGO_PKG_VERSION");
const APPLICATION_ROOT_DIR: &str = env!("CARGO_MANIFEST_DIR");

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct ApplicationEnv
{
	pub secret_number: i32,
	pub secret_string: String,
}

impl UserApplicationEnvInterface for ApplicationEnv
{
	const FILENAME: &'static str = ".env";

	//fn with_suffix(settings: &flex_kernel::settings::KernelSettings) -> impl
	// ToString
	//{
	//	match settings.process_mode {
	//		| flex_kernel::process::ProcessMode::LOCAL => "",
	//		| flex_kernel::process::ProcessMode::DEVELOPMENT => "dev",
	//		| flex_kernel::process::ProcessMode::PRODUCTION => "prod",
	//		| flex_kernel::process::ProcessMode::TEST => "test",
	//	}
	//}
}

impl ApplicationAdapterEnvInterface for AnyApplicationAdapter<ApplicationEnv>
{
	type Env = ApplicationEnv;

	fn env(&self) -> &Self::Env
	{
		self.env.as_ref().unwrap()
	}

	fn set_env(&mut self, env: Self::Env)
	{
		self.env.replace(env.clone());
	}
}

// ---- //
// Main //
// ---- //

fn main()
{
	let application = Application::new(
		APPLICATION_NAME,
		APPLICATION_VERSION,
		APPLICATION_ROOT_DIR,
	)
		// NOTE: Par défaut, le répertoire des fichiers des variables
		//       d'environnement est configuré sur
		// 		 APPLICATION_ROOT_DIR + "/env"
		.define_env_directory("examples/env")
		// NOTE: Récupère les variables d'environnement depuis le fichier
		//       `examples/env/.env`.
		.include_env_vars()
		// NOTE: Récupère les variables d'environnement depuis le fichier
		//       `/path/to/env-file`.
		// .with_env_vars("/path/to/env-file")
	;

	dbg!(application.env());

	application.run();
}
