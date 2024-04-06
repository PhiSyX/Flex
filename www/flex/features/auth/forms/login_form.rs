// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use flex_web_framework::types::email;

// --------- //
// Structure //
// --------- //

/// Données du formulaire de connexion au site.
#[derive(Debug)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct LoginFormData
{
	/// Identifiant de connexion.
	pub(crate) identifier: Identifier,
	/// Mot de passe de connexion.
	pub(crate) password: String,
	/// Se souvenir du client lors des prochains accès au site.
	pub(crate) remember_me: bool,
}

// ----------- //
// Énumération //
// ----------- //

/// Un identifiant est soit un pseudonyme, soit une adresse mail.
#[derive(Debug)]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum Identifier
{
	Email(email::EmailAddress),
	Username(String),
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl std::fmt::Display for Identifier
{
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result
	{
		let data = match self {
			| Self::Email(data) => data.as_ref(),
			| Self::Username(data) => data.as_ref(),
		};
		write!(f, "{}", data)
	}
}
