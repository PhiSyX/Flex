// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

mod flag;
mod host;
mod nick;

use std::collections::HashSet;
use std::net;

use flex_web_framework::types::secret;

pub use self::flag::Flag;
pub use self::nick::*;
use crate::src::chat::features::ApplyMode;

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
	/// Les drapeaux utilisateurs
	#[serde(skip_serializing)]
	flags: HashSet<ApplyMode<Flag>>,
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
			flags: Default::default(),
		}
	}
}

impl User
{
	/// Adresse de l'utilisateur en fonction d'un pattern.
	///
	/// Les types de patterns:
	///   - "*!ident@hostname"
	///   - "*!*ident@hostname"
	///   - "*!*@hostname"
	///   - "*!*ident@*.hostname"
	///   - "*!*@*.hostname"
	///   - "nick!ident@hostname"
	///   - "nick!*ident@hostname"
	///   - "nick!*@hostname"
	///   - "nick!*ident@*.hostname"
	///   - "nick!*@*.hostname"
	///   - "nick!*@*"
	///   - "*!*@*"
	pub fn address(&self, pattern: &str) -> String
	{
		match pattern {
			| "*!ident@hostname" => format!("*!{}@{}", self.ident, self.host),
			| "*!*ident@hostname" => format!("*!*{}@{}", self.ident, self.host),
			| "*!*@hostname" => format!("*!*@{}", self.host),
			| "*!*ident@*.hostname" => {
				let full_hostname = self.host.to_string();
				let (_, hostname) = full_hostname
					.split_once('.')
					.unwrap_or(("_", &full_hostname));
				format!("*!{}@*.{}", self.ident, hostname)
			}
			| "*!*@*.hostname" => {
				let full_hostname = self.host.to_string();
				let (_, hostname) = full_hostname
					.split_once('.')
					.unwrap_or(("_", &full_hostname));
				format!("*!*@*.{}", hostname)
			}
			| "nick!*ident@hostname" => {
				format!("{}!*{}@{}", self.nickname, self.ident, self.host)
			}
			| "nick!*@hostname" => {
				format!("{}!*@{}", self.nickname, self.host)
			}
			| "nick!*ident@*.hostname" => {
				let full_hostname = self.host.to_string();
				let (_, hostname) = full_hostname
					.split_once('.')
					.unwrap_or(("_", &full_hostname));
				format!("{}!*{}@*.{}", self.nickname, self.ident, hostname)
			}
			| "nick!*@*.hostname" => {
				let full_hostname = self.host.to_string();
				let (_, hostname) = full_hostname
					.split_once('.')
					.unwrap_or(("_", &full_hostname));
				format!("{}!*@*.{}", self.nickname, hostname)
			}
			| "nick!*@*" => format!("{}!*@*", self.nickname),
			| "*!*@*" => String::from("*!*@*"),
			| _ => self.full_address(),
		}
		// address
	}

	/// Adresse complète de l'utilisateur.
	pub fn full_address(&self) -> String
	{
		format!("{}!{}@{}", self.nickname, self.ident, self.host)
	}

	/// Message d'absence de l'utilisateur.
	pub fn away_message(&self) -> String
	{
		self.flags
			.iter()
			.find_map(|flag| {
				let ApplyMode {
					flag: Flag::Away(text),
					..
				} = flag
				else {
					return None;
				};
				(!text.is_empty()).then_some(text.to_owned())
			})
			.unwrap_or_default()
	}

	/// Les drapeaux utilisateurs.
	pub fn flags(&self) -> impl Iterator<Item = (char, ApplyMode<Flag>)> + '_
	{
		self.flags.iter().map(|flag| (flag.letter(), flag.clone()))
	}

	/// Vérifie que l'utilisateur a comme drapeau, le drapeau q (nokick).
	pub fn has_nokick_flag(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				ApplyMode {
					flag: Flag::NoKick,
					..
				}
			)
		})
	}

	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client.
	pub fn is_me(&self, nickname: &str) -> bool
	{
		self.nickname.to_lowercase().eq(&nickname.to_lowercase())
	}

	/// Vérifie que l'utilisateur a comme drapeau, le drapeau d'absence avec un
	/// message d'absence.
	pub fn is_away(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			let ApplyMode {
				flag: Flag::Away(text),
				..
			} = flag
			else {
				return false;
			};
			!text.is_empty()
		})
	}

	/// Vérifie que l'utilisateur a comme drapeau, les drapeaux d'opérateurs.
	pub fn is_operator(&self) -> bool
	{
		self.is_global_operator() || self.is_local_operator()
	}

	/// Vérifie que l'utilisateur a comme drapeau, le drapeaux d'opérateur
	/// global.
	pub fn is_global_operator(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				ApplyMode {
					flag: Flag::GlobalOperator,
					..
				}
			)
		})
	}

	/// Vérifie que l'utilisateur a comme drapeau, le drapeaux d'opérateur
	/// local.
	pub fn is_local_operator(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				ApplyMode {
					flag: Flag::LocalOperator,
					..
				}
			)
		})
	}

	/// Type d'opérateur.
	pub fn operator_type(&self) -> Option<&flag::Flag>
	{
		if self.is_global_operator() {
			return Some(&flag::Flag::GlobalOperator);
		}

		if self.is_local_operator() {
			return Some(&flag::Flag::LocalOperator);
		}

		None
	}
}

impl User
{
	/// Applique un drapeau à l'[utilisateur](Self).
	pub fn set_flag(&mut self, flag: impl Into<ApplyMode<flag::Flag>>)
	{
		self.flags.insert(flag.into());
	}

	/// Définit l'ident de l'[utilisateur](Self).
	pub fn set_ident(&mut self, ident: impl ToString) -> Result<String, nick::Error>
	{
		let ident = ident.to_string();
		self.ident = do_nickname(&ident)?.to_string();
		Ok(ident)
	}

	/// Définit un hôte virtual pour l'[utilisateur](Self).
	pub fn set_vhost(&mut self, vhost: impl ToString)
	{
		self.host.set_vhost(vhost);
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

	/// Dés-applique un drapeau à l'[utilisateur](Self).
	pub fn unset_flag(&mut self, mut retain_cb: impl FnMut(&flag::Flag) -> bool)
	{
		self.flags.retain(|flag| !retain_cb(flag));
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl PartialEq<Flag> for ApplyMode<Flag>
{
	fn eq(&self, other: &Flag) -> bool
	{
		self.flag.eq(other)
	}
}
