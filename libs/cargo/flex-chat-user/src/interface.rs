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
use std::hash::Hash;

use flex_chat_mode::ApplyMode;
use flex_secret::Secret;

use crate::nick;

// --------- //
// Interface //
// --------- //

pub trait UserInterface:
	Clone
	+ fmt::Debug
	+ serde::Serialize
	+ UserAddressInterface
	+ UserAwayInterface
	+ UserFlagInterface
	+ UserOperatorInterface
{
	type Host: ToString;

	/// Hôte de l'utilisateur.
	fn host(&self) -> &Self::Host;

	/// Identifiant de l'utilisateur.
	fn ident(&self) -> &str;

	/// Vérifie si le pseudonyme donné est le même que celui sauvegardé dans
	/// l'instance du client.
	fn is_itself(&self, nickname: &str) -> bool;

	/// Pseudo de l'utilisateur.
	fn nickname(&self) -> &str;

	/// Ancien pseudo de l'utilisateur.
	fn old_nickname(&self) -> &str;

	/// Mot de passe utilisateur utilisé pour la connexion au serveur.
	fn server_password(&self) -> Option<&Secret<String>>;

	/// Mot de passe utilisateur utilisé pour la connexion au serveur (exposed).
	fn server_password_exposed(&self) -> Option<&str>;

	/// Définit l'ident de l'[utilisateur](Self).
	fn set_ident(&mut self, ident: impl ToString) -> Result<String, nick::Error>;

	/// Définit un hôte virtual pour l'[utilisateur](Self).
	fn set_vhost(&mut self, vhost: impl ToString);

	/// Définit le pseudonyme de l'[utilisateur](Self).
	fn set_nickname(&mut self, nickname: impl ToString) -> Result<String, nick::Error>;

	/// Définit le mot de passe entré par l'[utilisateur](Self) lors de la
	/// commande PASS.
	fn set_password(&mut self, password: impl Into<Secret<String>>);

	/// Définit le nom réel de l'[utilisateur](Self).
	fn set_realname(&mut self, realname: impl ToString);
}

pub trait UserAddressInterface
{
	/// Adresse de l'utilisateur en fonction d'un pattern.
	///
	/// Les types de patterns:
	///   - "*!ident@*"
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
	fn address(&self, pattern: &str) -> String;

	/// Adresse complète de l'utilisateur.
	fn full_address(&self) -> String;
}

pub trait UserAwayInterface
{
	/// Message d'absence de l'utilisateur.
	fn away_message(&self) -> String;

	/// Vérifie que l'utilisateur a comme drapeau, le drapeau d'absence avec un
	/// message d'absence.
	fn is_away(&self) -> bool;
}

pub trait UserFlagInterface
{
	type Flag: serde::Serialize + PartialEq + Eq + Hash + Clone;

	/// Les drapeaux utilisateurs.
	fn flags(&self) -> impl Iterator<Item = (char, ApplyMode<Self::Flag>)> + '_;

	/// Vérifie que l'utilisateur a comme drapeau, le drapeau q (nokick).
	fn has_nokick_flag(&self) -> bool;

	/// Applique un drapeau à l'[utilisateur](Self).
	fn set_flag(&mut self, flag: impl Into<ApplyMode<Self::Flag>>);
}

pub trait UserOperatorInterface: UserFlagInterface
{
	/// Vérifie que l'utilisateur a comme drapeau, le drapeaux d'opérateur
	/// global.
	fn is_global_operator(&self) -> bool;

	/// Vérifie que l'utilisateur a comme drapeau, le drapeaux d'opérateur
	/// local.
	fn is_local_operator(&self) -> bool;

	/// Vérifie que l'utilisateur a comme drapeau, les drapeaux d'opérateurs.
	fn is_operator(&self) -> bool
	{
		self.is_global_operator() || self.is_local_operator()
	}

	/// Type d'opérateur.
	fn operator_type(&self) -> Option<&Self::Flag>;
}
