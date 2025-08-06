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
use serde_json::json;

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
	pub email_address: String,
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

		let mut errors = vec![];

		if this.username.trim().is_empty() {
			errors.push(json!({
				"detail": "Le nom NE DOIT PAS être vide",
				"pointer": "#/username"
			}));
		}

		if let Err(err) = this.email_address.parse::<email::EmailAddress>() {
			errors.push(json!({
				"type": "https://en.wikipedia.org/wiki/Email_address",
				"detail": err.to_string(),
				"pointer": "#/email_address"
			}));
		}

		if this.password != this.password_confirmation {
			errors.push(json!({
				"detail": "Les mots de passes ne sont pas identiques",
				"pointer": "#/password"
			}));
		}

		let password_size = this.password.len();
		if !(PASSWORD_LENGTH_MIN..=PASSWORD_LENGTH_MAX).contains(&password_size)
		{
			let reason = format!(
				"Un mot de passe valide DOIT être compris entre « {} » et « \
				 {} » caractères. La taille du mot de passe que tu as envoyé \
				 est de « {} ».",
				PASSWORD_LENGTH_MIN, PASSWORD_LENGTH_MAX, password_size,
			);
			errors.push(json!({
				"type": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls",
				"detail": reason,
				"pointer": "#/password"
			}));
		}

		if !errors.is_empty() {
			return Err(serde::de::Error::custom(json!(errors)));
		}

		Ok(this)
	}
}
