// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use lexa_kernel::{
	ApplicationAdapterCLIInterface,
	ApplicationAdapterEnvInterface,
	ApplicationAdapterInterface,
	ApplicationAdapterSettingsInterface,
	ApplicationCLIInterface,
	ApplicationEnvInterface,
	AsyncApplicationStartupExtension,
};

use crate::{server, settings};

// ---- //
// Type //
// ---- //

pub type Adapter<S, E, C> = server::Server<S, E, C>;

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ApplicationAdapterSettingsInterface for settings::ServerSettings
{
	const FILENAME: &'static str = Self::FILENAME;
}

impl<S, E, C> ApplicationAdapterInterface for Adapter<S, E, C>
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

impl<S, E, C> AsyncApplicationStartupExtension for Adapter<S, E, C>
{
	async fn run(mut self)
	{
		self.display_all_routes();
		self = self.define_static_resources();
		self.launch().await.expect("Ouverture du serveur HTTP");
	}
}

impl<S, E, C> ApplicationAdapterEnvInterface for Adapter<S, E, C>
where
	E: ApplicationEnvInterface,
{
	type Env = E;

	fn env(&self) -> &Self::Env
	{
		self.env_vars.as_ref().expect(
			"Il ne faut pas oublier d'appeler « application.include_env_vars() » à \
			 l'initialisation de l'application.",
		)
	}

	fn set_env(&mut self, env: Self::Env)
	{
		self.env_vars.replace(env);
	}
}

impl<S, E, C> ApplicationAdapterCLIInterface for Adapter<S, E, C>
where
	C: ApplicationCLIInterface,
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
