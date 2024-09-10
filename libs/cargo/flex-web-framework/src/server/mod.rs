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
mod state;
mod net
{
	pub use std::net::SocketAddr;

	pub use tokio::net::*;
}

use axum_server::tls_rustls::RustlsConfig;
use console::style;
use flex_kernel::{
	ApplicationAdapterCLIInterface,
	ApplicationAdapterEnvInterface,
	ApplicationAdapterInterface,
	ApplicationAdapterSettingsInterface,
	AsyncApplicationStartupExtension,
	UserApplicationCLIInterface,
	UserApplicationEnvInterface,
};

pub use self::error::Error as ServerError;
pub use self::state::ServerState;
use crate::http::routing::HttpRouterCollection;
use crate::settings::ServerSettings;
use crate::{server, settings, AxumState};

// --------- //
// Structure //
// --------- //

#[non_exhaustive]
pub struct Server<UserState, UserEnv, UserCLI>
{
	/// Les variables d'environnement.
	pub env_vars: Option<UserEnv>,
	/// Les arguments de la CLI.
	pub cli_args: Option<UserCLI>,
	/// Paramètres du serveur HTTP.
	pub settings: ServerSettings,
	/// Routeur du serveur HTTP.
	pub router: HttpRouterCollection<UserState>,
	/// État global du serveur.
	pub state: AxumState<UserState>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<S, E, C> Server<S, E, C>
{
	pub fn define_default_state(mut self, state: S) -> Self
	{
		self.state.set_state(state);
		self
	}
}

impl<S, E, C> Server<S, E, C>
{
	pub(super) fn define_static_resources(mut self) -> Self
	{
		for static_resource in self.settings.static_resources.iter() {
			self.router.global = self.router.global.nest_service(
				&static_resource.url_path,
				tower_http::services::ServeDir::new(&static_resource.dir_path)
					.append_index_html_on_directories(false)
					.precompressed_gzip()
					.precompressed_br()
					.precompressed_deflate()
					.precompressed_zstd(),
			);
		}

		self
	}
}

impl<S, E, C> Server<S, E, C>
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

impl<S, E, C> Server<S, E, C>
{
	/// Démarre un serveur HTTP se basant sur des paramètres serveur.
	pub(super) async fn launch(self) -> Result<(), ServerError>
	{
		let router = self.router.global();

		let addr = self.settings.socket_addr();

		type S = net::SocketAddr;

		if let Some(tls_settings) = self.settings.tls.as_ref() {
			let tls_config = RustlsConfig::from_pem_file(
				&tls_settings.cert_file,
				&tls_settings.key_file,
			)
			.await?;
			println!("URL: https://{}", addr);
			let mut server = axum_server::bind_rustls(addr, tls_config);
			server.http_builder().http2();
			server
				.serve(router.into_make_service_with_connect_info::<S>())
				.await?;
		} else {
			let listener = net::TcpListener::bind(addr).await?;
			println!("URL: http://{}", listener.local_addr()?);
			axum::serve(
				listener,
				router.into_make_service_with_connect_info::<S>(),
			)
			.await?;
		}

		Ok(())
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ApplicationAdapterSettingsInterface for settings::ServerSettings
{
	const FILENAME: &'static str = Self::FILENAME;
}

impl<S, E, C> ApplicationAdapterInterface for server::Server<S, E, C>
{
	type Settings = settings::ServerSettings;

	fn new(settings: Self::Settings) -> Self
	{
		Self {
			settings,
			router: Default::default(),
			env_vars: Default::default(),
			cli_args: Default::default(),
			state: Default::default(),
		}
	}
}

impl<S, E, C> AsyncApplicationStartupExtension for server::Server<S, E, C>
{
	async fn run(mut self)
	{
		self.display_all_routes();
		self = self.define_static_resources();
		self.launch().await.expect("Ouverture du serveur HTTP");
	}
}

impl<S, E, C> ApplicationAdapterEnvInterface for server::Server<S, E, C>
where
	E: UserApplicationEnvInterface,
{
	type Env = E;

	fn env(&self) -> &Self::Env
	{
		self.env_vars.as_ref().expect(
			"Il ne faut pas oublier d'appeler « \
			 application.include_env_vars() » à l'initialisation de \
			 l'application.",
		)
	}

	fn set_env(&mut self, env: Self::Env)
	{
		self.env_vars.replace(env);
	}
}

impl<S, E, C> ApplicationAdapterCLIInterface for server::Server<S, E, C>
where
	C: UserApplicationCLIInterface,
{
	type CLI = C;

	fn cli(&self) -> &Self::CLI
	{
		self.cli_args.as_ref().unwrap()
	}

	fn set_cli(&mut self, cli_args: Self::CLI)
	{
		self.cli_args.replace(cli_args);
	}
}
