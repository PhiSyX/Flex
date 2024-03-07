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
use flex_crypto::{Encryption, EncryptionCtor};
use flex_web_framework::types::secret;
use lexa_logger::layout;

// --------- //
// Structure //
// --------- //

/// Commande CLI: "make-password"
#[derive(Debug)]
#[derive(Clone)]
#[derive(clap::Parser)]
pub struct MakePassword
{
	/// Mot de passe à chiffrer avec l'algorithme de chiffrement Argon2.
	password: secret::Secret<String>,
	/// Algorithme d'hachage ou de chiffrement.
	#[clap(value_enum)]
	#[clap(long, default_value = "argon2")]
	algorithm: PasswordAlgorithm,
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
pub enum PasswordAlgorithm
{
	/// Algorithme Argon2.
	#[default]
	Argon2,
}

// -------------- //
// Implémentation //
// -------------- //

impl MakePassword
{
	pub fn handle(&self)
	{
		let title = "Chiffrement du mot de passe";

		println!(".{}.", "-".repeat(title.len() + 2));
		println!("| {title} |");
		println!("'{}'", "-".repeat(title.len() + 2));
		println!();

		match self.algorithm {
			| PasswordAlgorithm::Argon2 => {
				if self.app_secret.is_none() {
					eprintln!("La clé secrète d'application DOIT être définie.");
					return;
				}

				let app_secret_key = self.app_secret.as_ref().unwrap();

				let argon2 = flex_crypto::Argon2Encryption::new(app_secret_key.expose().as_str());
				let encoded = argon2
					.encrypt(self.password.expose())
					.expect("Impossible d'encoder le mot de passe avec l'algorithme Argon2.");

				display_output::<flex_crypto::Argon2Encryption>(encoded);
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
