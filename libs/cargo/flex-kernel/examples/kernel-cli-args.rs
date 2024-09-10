/*
 * Any copyright is dedicated to the Public Domain.
 * https://creativecommons.org/publicdomain/zero/1.0/
 */
// Cette exemple à besoin de la dépendance `clap`.

mod external_crate;

use external_crate::AnyApplicationAdapter;
use flex_kernel::{
	ApplicationAdapterCLIInterface,
	ApplicationCLIInterface,
	ApplicationStartupExtension,
	UserApplicationCLIInterface,
};

// -------- //
// Constant //
// -------- //

const APPLICATION_NAME: &str = "flex-app";
const APPLICATION_VERSION: &str = env!("CARGO_PKG_VERSION");
const APPLICATION_ROOT_DIR: &str = env!("CARGO_MANIFEST_DIR");

// ---- //
// Type //
// ---- //

type Application = flex_kernel::Kernel<
	// NOTE: dans la vraie vie, on n'a pas besoin de passer par des génériques.
	// c'est uniquement pour l'exemple.
	AnyApplicationAdapter<(), ApplicationCLI>,
	(),
	ApplicationCLI,
>;

// --------- //
// Structure //
// --------- //

#[derive(clap::Parser)]
#[derive(Debug)]
#[derive(Clone)]
pub struct ApplicationCLI
{
	channel: String,
}

impl UserApplicationCLIInterface for ApplicationCLI
{
	fn arguments() -> Self
	{
		use clap::Parser;
		Self::parse()
	}
}

impl<E> ApplicationAdapterCLIInterface
	for AnyApplicationAdapter<E, ApplicationCLI>
{
	type CLI = ApplicationCLI;

	fn cli(&self) -> &Self::CLI
	{
		self.cli.as_ref().unwrap()
	}

	fn set_cli(&mut self, cli_args: Self::CLI)
	{
		self.cli.replace(cli_args.clone());
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
	.include_cli_args();

	dbg!(application.cli_args());

	application.run();
}
