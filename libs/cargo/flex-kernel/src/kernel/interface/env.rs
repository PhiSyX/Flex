// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt::Debug;

use crate::Kernel;

// --------- //
// Interface //
// --------- //

/// Extension d'application pour les variables d'environnement.
///
/// `<UserEnv>` :: une structure de champs nommés. Cependant, si une application
/// N'A PAS besoin de variables d'environnement, ce dernier PEUT également être
/// un tuple vide.
pub trait ApplicationEnvInterface<UserEnv>
where
	UserEnv: UserApplicationEnvInterface,
{
	/// Définit le répertoire des variables d'environnement.
	fn define_env_directory(self, dir: impl Into<std::path::PathBuf>) -> Self;

	/// Les variables d'environnement de l'application. En supposant qu'ils ont
	/// été définie par la fonction d'implémentation [Self::include_env_vars()]
	/// ou [Self::with_env_vars()].
	fn env(&self) -> UserEnv;

	/// Inclut les variables d'environnement de l'application à partir d'un
	/// fichier d'environnement (ex: .env). Ce fichier est résolu en fonction du
	/// mode d'exécution.
	fn include_env_vars(self) -> Self;

	/// Inclut les variables d'environnement de l'application à partir d'un
	/// fichier d'environnement explicitement donné en argument.
	fn with_env_vars(self, env_filepath: impl AsRef<std::path::Path>) -> Self
	where
		UserEnv: serde::de::DeserializeOwned;
}

/// Interface adapter liée aux variables d'environnement.
pub trait ApplicationAdapterEnvInterface
{
	type Env: UserApplicationEnvInterface;

	/// Les variables d'environnement de l'application.
	fn env(&self) -> &Self::Env;

	/// Définit les variables d'environnement de l'application pour l'adapter.
	fn set_env(&mut self, env: Self::Env);
}

/// Interface pour la récupération des variables d'environnement.
pub trait UserApplicationEnvInterface
	: Clone
	+ Debug
	+ serde::de::DeserializeOwned
{
	/// Nom du fichier d'environnement. Ce fichier DOIT se trouver dans le
	/// répertoire des fichiers des variables d'environnement.
	const FILENAME: &'static str;

	/// Ajouter un suffixe au fichier d'environnement. Accès aux paramètres
	/// du kernel.
	fn with_suffix(_: &crate::settings::KernelSettings) -> impl ToString
	{
		String::default()
	}

	/// Initialise la [structure de champs nommés](Self) en dé-sérialisant un
	/// fichier d'environnement.
	fn fetch_from_file(
		env_filepath: impl AsRef<std::path::Path>,
	) -> Result<Self, crate::KernelError>
	where
		Self: serde::de::DeserializeOwned,
	{
		Ok(flex_env::from_file(env_filepath)?)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<A, UserEnv, C> ApplicationEnvInterface<UserEnv> for Kernel<A, UserEnv, C>
where
	UserEnv: UserApplicationEnvInterface,
	A: ApplicationAdapterEnvInterface<Env = UserEnv>,
{
	fn define_env_directory(
		mut self,
		dir: impl Into<std::path::PathBuf>,
	) -> Self
	{
		self.settings.directory.set_env_directory(dir);
		self
	}

	fn env(&self) -> UserEnv
	{
		self.env_vars.clone().expect(
			"\nVeuillez appeler la méthode « Kernel#include_env_vars » lors \
			 de l'initialisation de l'application.\n",
		)
	}

	fn include_env_vars(self) -> Self
	{
		let env_filepath = format!(
			"{}{}",
			UserEnv::FILENAME,
			UserEnv::with_suffix(&self.settings).to_string(),
		);
		let env_filepath =
			self.settings.directory.env_sudo().join(env_filepath);
		self.with_env_vars(env_filepath)
	}

	fn with_env_vars(
		mut self,
		env_filepath: impl AsRef<std::path::Path>,
	) -> Self
	where
		UserEnv: serde::de::DeserializeOwned,
	{
		match UserEnv::fetch_from_file(&env_filepath) {
			| Ok(env_vars) => {
				log::debug!(
					"Variables d'environnement de l'application « {:#?} »",
					&env_vars
				);
				self.application_adapter.set_env(env_vars.clone());
				self.env_vars.replace(env_vars);
			}

			| Err(err) => {
				let ef_s = env_filepath.as_ref().display();
				let err_s = format!(
					"Erreur liée aux variables d'environnement « {ef_s} » : \
					 {err}"
				);
				self.logger_signal.send_error(err_s);
			}
		};

		self
	}
}
