// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod make_password;

use std::ops;

use flex_cli::{EmptyArguments, EmptyFlags, EmptyOptions};
use lexa_kernel::ApplicationCLIInterface;

// ---- //
// Type //
// ---- //

type cli_lib = flex_cli::CLI<
	EmptyArguments,
	EmptyFlags,
	EmptyOptions,
	flex_cli_command
>;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
pub struct FlexCLI(cli_lib);

#[derive(Debug)]
#[derive(Clone)]
#[derive(clap::Subcommand)]
pub enum flex_cli_command
{
	/// Accès à la commande "make-password".
	MakePassword(make_password::FlexCLIMakePassword),
}

// -------------- //
// Implémentation //
// -------------- //

impl FlexCLI
{
	pub fn has_command(&self) -> bool
	{
		self.command.is_some()
	}

	pub fn handle_command(&self)
	{
		assert!(self.has_command());

		match self.command.as_ref().unwrap() {
			| flex_cli_command::MakePassword(cmd) => cmd.handle(),
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl ApplicationCLIInterface for FlexCLI
{
	fn arguments() -> Self
	{
		Self(cli_lib::arguments())
	}
}

impl ops::Deref for FlexCLI
{
	type Target = cli_lib;

	fn deref(&self) -> &Self::Target
	{
		&self.0
	}
}
