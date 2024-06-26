// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::fmt;

use flex_cli::style;
use flex_crypto::Hasher;
use flex_logger::layout;
use flex_web_framework::security::Argon2Password;
use flex_web_framework::types::secret;
use flex_web_framework::ExtensionInterface;

// --------- //
// Structure //
// --------- //

/// Commande CLI: "make-password"
#[derive(Debug)]
#[derive(Clone)]
#[derive(clap::Parser)]
pub struct FlexCLIMakePassword
{
	/// Mot de passe à chiffrer avec l'algorithme de chiffrement Argon2.
	password: secret::Secret<String>,
	/// Algorithme d'hachage ou de chiffrement.
	#[clap(value_enum)]
	#[clap(long, default_value = "argon2")]
	algorithm: FlexCLIMakePasswordAlgorithm,
	/// Clé secrète d'application.
	#[clap(env = "APP_SECRET")]
	app_secret: Option<secret::Secret<String>>,
}

/// Les algorithmes de hachage ou de chiffrement disponibles:
#[derive(Debug)]
#[derive(Default)]
#[derive(Copy, Clone)]
#[derive(PartialEq, Eq)]
#[derive(clap::ValueEnum)]
#[non_exhaustive]
pub enum FlexCLIMakePasswordAlgorithm
{
	/// Algorithme Argon2.
	#[default]
	Argon2,
}

// -------------- //
// Implémentation //
// -------------- //

impl FlexCLIMakePassword
{
	pub fn handle(&self)
	{
		let title = "Chiffrement du mot de passe";

		println!(".{}.", "-".repeat(title.len() + 2));
		println!("| {title} |");
		println!("'{}'", "-".repeat(title.len() + 2));
		println!();

		match self.algorithm {
			| FlexCLIMakePasswordAlgorithm::Argon2 => {
				if self.app_secret.is_none() {
					let err = "La clé secrète d'application DOIT être définie.";
					eprintln!("{err}");
					return;
				}

				let app_secret_key = self.app_secret.as_ref().unwrap();

				let exposed_secret = app_secret_key.expose();
				#[rustfmt::skip]
				let argon2 = Argon2Password::new(exposed_secret.as_str().into());
				let encoded = argon2.hash(self.password.expose()).expect(
					"Impossible d'encoder le mot de passe avec l'algorithme \
					 Argon2.",
				);

				display_output::<Argon2Password>(encoded);
			}
		}

		println!(
			"{} Le chiffrement du mot de passe a réussi.",
			style("[OK]").green()
		);
	}
}

fn display_output<Encryption>(output: impl fmt::Display)
{
	let mut grid = layout::GridLayout::new()
		.define_max_width(60)
		.with_style(layout::STYLE_THIN);

	grid.add_line([
		layout::Cell::new("Service de chiffrement utilisé"),
		layout::Cell::new(std::any::type_name::<Encryption>()),
	]);
	grid.add_line([
		layout::Cell::new("Mot de passe chiffré"),
		layout::Cell::new(output),
	]);

	println!("{}", grid.render());
}
