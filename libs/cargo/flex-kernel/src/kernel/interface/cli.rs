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

/// Extension d'application pour la récupération des arguments de CLI.
///
/// `<UserCLI>` :: une structure de champs nommés. Si une application N'A PAS
/// besoin de ces arguments, ce dernier PEUT également être un tuple vide.
pub trait ApplicationCLIInterface<UserCLI>
where
	UserCLI: UserApplicationCLIInterface,
{
	/// Les arguments de la CLI de l'application. En supposant qu'ils ont été
	/// définie par la fonction d'implémentation [Self::include_cli_args()].
	fn cli_args(&self) -> UserCLI;

	/// Inclut les arguments de la CLI.
	fn include_cli_args(self) -> Self;
}

/// Interface adapter liée aux variables d'environnement.
pub trait ApplicationAdapterCLIInterface
{
	type CLI: UserApplicationCLIInterface;

	/// Les arguments de la CLI de l'application.
	fn cli(&self) -> &Self::CLI;

	/// Définit les arguments de la CLI de l'application pour l'adapter.
	fn set_cli(&mut self, cli_args: Self::CLI);
}

/// Interface pour la récupération des arguments de la CLI.
#[rustfmt::skip]
pub trait UserApplicationCLIInterface
	: Clone
	+ Debug
{
	/// Récupère les arguments de la CLI.
	fn arguments() -> Self;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<A, E, UserCLI> ApplicationCLIInterface<UserCLI> for Kernel<A, E, UserCLI>
where
	UserCLI: UserApplicationCLIInterface,
	A: ApplicationAdapterCLIInterface<CLI = UserCLI>,
{
	fn cli_args(&self) -> UserCLI
	{
		self.cli_args.clone().expect(
			"Veuillez appeler la méthode « Kernel#include_cli_args » lors de \
			 l'initialisation de l'application.",
		)
	}

	fn include_cli_args(mut self) -> Self
	{
		let arguments = UserCLI::arguments();
		log::debug!(
			"Arguments de la CLI de l'application « {:#?} »",
			&arguments
		);
		self.application_adapter.set_cli(arguments.clone());
		self.cli_args.replace(arguments);
		self
	}
}
