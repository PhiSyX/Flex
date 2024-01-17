// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod host;
mod nick;

use std::net;

use flex_web_framework::types::secret;

pub use self::nick::*;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct User
{
	/// Hôte de l'utilisateur (Basé sur [net::SocketAddr] et [net::IpAddr]).
	pub host: self::host::Host,
	/// Mot de passe reçu par la commande PASS.
	#[serde(skip_serializing)]
	pub pass: Option<secret::Secret<String>>,
	/// Ancien pseudonyme de l'utilisateur.
	#[serde(skip_serializing)]
	pub old_nickname: Option<String>,
	/// Pseudonyme courant de l'utilisateur.
	pub nickname: String,
	/// Identifiant de l'utilisateur.
	pub ident: String,
	/// Le nom réel de l'utilisateur.
	#[serde(skip_serializing)]
	pub realname: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl User
{
	/// Crée une nouvelle instance de [User].
	///
	/// # Note à propos des paramètres :
	///
	///  - `addr`: Adresse IP de l'utilisateur.
	///
	///    > L'idée de ce paramètre n'étant pas de définir l'argument
	///    > à la main, comme montré dans les exemples. L'idée est de
	///    > devoir récupérer l'IP de l'utilisateur à partir de son
	///    > adresse socket [std::net::SocketAddr].
	pub fn new(ip: net::IpAddr) -> Self
	{
		Self {
			host: self::host::Host::new(ip),
			ident: Default::default(),
			nickname: Default::default(),
			old_nickname: Default::default(),
			pass: Default::default(),
			realname: Default::default(),
		}
	}
}

impl User
{
	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client.
	pub fn is_me(&self, nickname: &str) -> bool
	{
		self.nickname.to_lowercase().eq(&nickname.to_lowercase())
	}
}

impl User
{
	/// Définit l'ident de l'[utilisateur](Self).
	pub fn set_ident(&mut self, ident: impl ToString) -> Result<String, nick::Error>
	{
		let ident = ident.to_string();
		self.ident = do_nickname(&ident)?.to_string();
		Ok(ident)
	}

	/// Définit le pseudonyme de l'[utilisateur](Self).
	pub fn set_nickname(&mut self, nickname: impl ToString) -> Result<String, nick::Error>
	{
		let new_nick = nickname.to_string();
		self.old_nickname.replace(self.nickname.to_owned());

		let new_nick = do_nickname(&new_nick)?;

		if self.old_nickname.is_none() {
			self.old_nickname.replace(new_nick.to_owned());
		} else if let Some(old_nick) = self.old_nickname.as_deref() {
			if old_nick.is_empty() {
				self.old_nickname.replace(new_nick.to_owned());
			}
		}

		self.nickname = new_nick.to_owned();
		Ok(self.nickname.to_owned())
	}

	/// Définit le mot de passe entré par l'[utilisateur](Self) lors de la
	/// commande PASS.
	pub fn set_password(&mut self, password: impl Into<secret::Secret<String>>)
	{
		self.pass.replace(password.into());
	}

	/// Définit le nom réel de l'[utilisateur](Self).
	pub fn set_realname(&mut self, realname: impl ToString)
	{
		self.realname = realname.to_string();
	}
}
