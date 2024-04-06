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
mod interface;
mod nick;
mod validation;

use std::collections::HashSet;
use std::net;
use std::sync::Arc;

use flex_chat_mode::ApplyMode;
use flex_secret::Secret;

pub use self::flag::*;
pub use self::host::*;
pub use self::interface::*;
pub use self::nick::*;
pub use self::validation::*;

// ---- //
// Type //
// ---- //

pub type Mode = ApplyMode<Flag>;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct User
{
	/// Hôte de l'utilisateur (Basé sur [net::SocketAddr] et [net::IpAddr]).
	host: self::host::Host,
	/// Mot de passe serveur, reçu par la commande /PASS.
	#[serde(skip_serializing)]
	pub server_password: Option<Secret<Arc<str>>>,
	/// Ancien pseudonyme de l'utilisateur.
	#[serde(skip_serializing)]
	pub old_nickname: Option<String>,
	/// Pseudonyme courant de l'utilisateur.
	nickname: String,
	/// Identifiant de l'utilisateur.
	ident: String,
	/// Le nom réel de l'utilisateur.
	#[serde(skip_serializing)]
	pub realname: String,
	/// Les drapeaux utilisateurs
	#[serde(skip_serializing)]
	flags: HashSet<Mode>,
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
			server_password: Default::default(),
			realname: Default::default(),
			flags: Default::default(),
		}
	}
}

impl User
{
	/// Dés-applique un drapeau à l'[utilisateur](Self).
	pub fn unset_flag(&mut self, mut retain_cb: impl FnMut(&flag::Flag) -> bool)
	{
		self.flags.retain(|flag| !retain_cb(flag));
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl UserInterface for User
{
	type Host = Host;

	fn host(&self) -> &Self::Host
	{
		&self.host
	}

	fn ident(&self) -> &str
	{
		&self.ident
	}

	fn is_itself(&self, nickname: &str) -> bool
	{
		self.nickname.to_lowercase().eq(&nickname.to_lowercase())
	}

	fn nickname(&self) -> &str
	{
		&self.nickname
	}

	fn old_nickname(&self) -> &str
	{
		self.old_nickname.as_deref().unwrap()
	}

	fn server_password(&self) -> Option<&Secret<Arc<str>>>
	{
		self.server_password.as_ref()
	}

	fn server_password_exposed(&self) -> Option<&Arc<str>>
	{
		self.server_password.as_deref()
	}

	/// Définit l'ident de l'[utilisateur](Self).
	fn set_ident(&mut self, ident: impl ToString) -> Result<String, Error>
	{
		let ident = ident.to_string();
		self.ident = do_nickname(&ident)?.to_string();
		Ok(ident)
	}

	/// Définit un hôte virtual pour l'[utilisateur](Self).
	fn set_vhost(&mut self, vhost: impl ToString)
	{
		self.host.set_vhost(vhost);
	}

	/// Définit le pseudonyme de l'[utilisateur](Self).
	fn set_nickname(&mut self, nickname: impl ToString) -> Result<String, Error>
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

		new_nick.clone_into(&mut self.nickname);
		Ok(self.nickname.to_owned())
	}

	/// Définit le mot de passe entré par l'[utilisateur](Self) lors de la
	/// commande PASS.
	fn set_password(&mut self, password: impl Into<Secret<Arc<str>>>)
	{
		self.server_password.replace(password.into());
	}

	/// Définit le nom réel de l'[utilisateur](Self).
	fn set_realname(&mut self, realname: impl ToString)
	{
		self.realname = realname.to_string();
	}
}

impl UserAddressInterface for User
{
	fn address(&self, pattern: &str) -> String
	{
		match pattern {
			| "*!ident@*" => format!("*!{}@*", self.ident),
			| "*!*ident@*" => format!("*!*{}@*", self.ident),
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
	}

	fn full_address(&self) -> String
	{
		format!("{}!{}@{}", self.nickname, self.ident, self.host)
	}
}

impl UserAwayInterface for User
{
	fn away_message(&self) -> String
	{
		self.flags
			.iter()
			.find_map(|flag| {
				let Mode {
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

	fn is_away(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			let Mode {
				flag: Flag::Away(text),
				..
			} = flag
			else {
				return false;
			};
			!text.is_empty()
		})
	}
}

impl UserFlagInterface for User
{
	type Flag = Flag;

	fn flags(&self) -> impl Iterator<Item = (char, Mode)> + '_
	{
		self.flags.iter().map(|flag| (flag.letter(), flag.clone()))
	}

	fn has_nokick_flag(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				Mode {
					flag: Self::Flag::NoKick,
					..
				}
			)
		})
	}

	fn set_flag(&mut self, flag: impl Into<Mode>)
	{
		self.flags.insert(flag.into());
	}
}

impl UserOperatorInterface for User
{
	fn is_global_operator(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				Mode {
					flag: Flag::GlobalOperator,
					..
				}
			)
		})
	}

	fn is_local_operator(&self) -> bool
	{
		self.flags.iter().any(|flag| {
			matches!(
				flag,
				Mode {
					flag: Flag::LocalOperator,
					..
				}
			)
		})
	}

	fn operator_type(&self) -> Option<&Self::Flag>
	{
		if self.is_global_operator() {
			return Some(&Self::Flag::GlobalOperator);
		}

		if self.is_local_operator() {
			return Some(&Self::Flag::LocalOperator);
		}

		None
	}
}

// Mode

impl PartialEq<Flag> for Mode
{
	fn eq(&self, other: &Flag) -> bool
	{
		self.flag.eq(other)
	}
}
