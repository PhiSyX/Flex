/*
 * Any copyright is dedicated to the Public Domain.
 * https://creativecommons.org/publicdomain/zero/1.0/
 */

mod external_crate;

use external_crate::AnyApplicationAdapter;
use flex_kernel::ApplicationStartupExtension;

// -------- //
// Constant //
// -------- //

const APPLICATION_NAME: &str = "flex-app";
const APPLICATION_VERSION: &str = env!("CARGO_PKG_VERSION");
const APPLICATION_ROOT_DIR: &str = env!("CARGO_MANIFEST_DIR");

// -------- //
// Fonction //
// -------- //

fn main()
{
	type Application = flex_kernel::Kernel<AnyApplicationAdapter>;

	let application = Application::new(
		APPLICATION_NAME,
		APPLICATION_VERSION,
		APPLICATION_ROOT_DIR,
	);

	application.run();
}
