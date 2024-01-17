// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

pub use console::style;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(clap::Parser)]
#[clap(author, version, about, long_about = None)]
#[command(propagate_version = true)]
pub struct CLI<Arguments, Flags, Options, Command>
where
	Arguments: clap::Args,
	Flags: clap::Args,
	Options: clap::Args,
	Command: clap::Subcommand,
{
	/// Les arguments.
	#[clap(flatten)]
	pub arguments: Arguments,
	/// Les drapeaux (--flag obligatoire).
	#[clap(flatten)]
	pub flags: Flags,
	/// Les options (--option).
	#[clap(flatten)]
	pub options: Options,
	/// Le commande.
	#[clap(subcommand)]
	pub command: Option<Command>,
}

#[derive(Debug)]
#[derive(Default)]
#[derive(Copy, Clone)]
#[derive(clap::Args)]
pub struct EmptyArguments {}

#[derive(Debug)]
#[derive(Default)]
#[derive(Copy, Clone)]
#[derive(clap::Args)]
pub struct EmptyFlags {}

#[derive(Debug)]
#[derive(Default)]
#[derive(Copy, Clone)]
#[derive(clap::Args)]
pub struct EmptyOptions {}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(clap::Subcommand)]
#[derive(Copy, Clone)]
pub enum EmptyCommand {}

// -------------- //
// Implémentation //
// -------------- //

impl<A, F, O, C> CLI<A, F, O, C>
where
	A: clap::Args,
	F: clap::Args,
	O: clap::Args,
	C: clap::Subcommand,
{
	/// Construit la structure [CLI] à partir des arguments de la ligne de
	/// commande (basé sur [std::env::args_os]).
	pub fn arguments() -> Self
	{
		use clap::Parser;
		Self::parse()
	}
}
