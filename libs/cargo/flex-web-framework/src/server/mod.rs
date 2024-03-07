// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod error;
mod settings;
mod state;
mod net
{
	pub use std::net::SocketAddr;

	pub use tokio::net::*;
}

use console::style;

pub use self::error::Error as ServerError;
pub use self::settings::Settings;
pub use self::state::ServerState;
use crate::routing::RouterCollection;
use crate::AxumState;

// --------- //
// Structure //
// --------- //

#[non_exhaustive]
pub struct Server<UserEnv, UserCLI>
{
	/// Les variables d'environnement.
	pub env_vars: Option<UserEnv>,
	/// Les arguments de la CLI.
	pub cli_args: Option<UserCLI>,
	/// Paramètres du serveur HTTP.
	pub settings: Settings,
	/// Routeur du serveur HTTP.
	pub router: RouterCollection,
	/// État global du serveur.
	pub state: AxumState,
}

// -------------- //
// Implémentation //
// -------------- //

impl<E, C> Server<E, C>
{
	pub(super) fn define_static_resources(mut self) -> Self
	{
		for static_resource in self.settings.static_resources.iter() {
			self.router.global = self.router.global.nest_service(
				&static_resource.url_path,
				tower_http::services::ServeDir::new(&static_resource.dir_path),
			);
		}

		self
	}
}

impl<E, C> Server<E, C>
{
	/// Affiche les routes enregistrées du serveur.
	pub(super) fn display_all_routes(&self)
	{
		println!();

		println!("Les ressources statiques du serveur:");
		for static_resource in self.settings.static_resources.iter() {
			println!(
				"\t[{}]: {} -> {}",
				style("STATIC").magenta(),
				style(&static_resource.url_path).bright().green(),
				style(static_resource.dir_path.display()).bright().black(),
			);
		}

		println!();

		println!("Toutes les routes du serveur:");
		for router in self.router.all() {
			let methods = router
				.methods()
				.map(|method| style(format!("{method:?}")).yellow().to_string())
				.collect::<Vec<_>>()
				.join(" | ");

			let full_url_path = style(&router.fullpath).bright().green();
			let route_name = style(&router.name).bright().black();

			println!("\t[{}]: {} as {}", methods, full_url_path, route_name);
		}

		println!();
	}
}

impl<E, C> Server<E, C>
{
	/// Démarre un serveur HTTP se basant sur des paramètres serveur.
	pub(super) async fn launch(self) -> Result<(), ServerError>
	{
		let router = self.router.global();

		let listener = net::TcpListener::bind(self.settings.socket_addr()).await?;

		println!("URL: http://{}", listener.local_addr()?);

		type S = net::SocketAddr;

		axum::serve(listener, router.into_make_service_with_connect_info::<S>()).await?;

		Ok(())
	}
}
