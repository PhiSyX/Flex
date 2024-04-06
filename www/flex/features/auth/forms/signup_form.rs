// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::{email, secret};

use crate::features::auth::specs::owasp::{
	PASSWORD_LENGTH_MAX,
	PASSWORD_LENGTH_MIN,
};

// --------- //
// Structure //
// --------- //

/// Données du formulaire d'inscription au site.
#[derive(Debug)]
#[derive(serde::Deserialize)]
#[serde(remote = "Self")]
pub struct RegistrationFormData
{
	/// Nouveau nom d'utilisateur.
	pub username: String,
	/// Adresse e-mail de l'utilisateur associé à l'identifiant.
	pub email_address: email::EmailAddress,
	/// Mot de passe du compte.
	pub password: secret::Secret<String>,
	/// Confirmation du mot de passe.
	pub password_confirmation: secret::Secret<String>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'de> serde::Deserialize<'de> for RegistrationFormData
{
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let this = Self::deserialize(deserializer)?;

		if this.username.trim().is_empty() {
			let reason = "[username]: le nom NE DOIT PAS être vide.";
			return Err(serde::de::Error::custom(reason));
		}

		if this.password != this.password_confirmation {
			let reason = "[password]: les mots de passes ne sont pas identiques";
			return Err(serde::de::Error::custom(reason));
		}

		let password_size = this.password.len();
		if !(PASSWORD_LENGTH_MIN..=PASSWORD_LENGTH_MAX).contains(&password_size) {
			let reason = format!(
				"[password]: un mot de passe valide DOIT être compris entre « \
				 {} » et « {} » caractères. La taille du mot de passe que \
				 vous avez envoyé est de « {} ».",
				PASSWORD_LENGTH_MIN, PASSWORD_LENGTH_MAX, password_size,
			);
			return Err(serde::de::Error::custom(reason));
		}

		Ok(this)
	}
}
