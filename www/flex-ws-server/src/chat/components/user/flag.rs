// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// -------- //
// Constant //
// -------- //

/// Drapeau '`a`': utilisateur marqué comme [absent](Flag::Away).
///
/// Ce drapeau NE DOIT PAS être activable par l'utilisateur à l'aide de la
/// commande `/MODE`, mais à l'aide de la commande `/AWAY`.
pub const USER_FLAG_AWAY: char = 'a';

/// Drapeau '`o`': utilisateur marqué comme opérateur ([Flag::GlobalOperator]).
///
/// Si un utilisateur tente de se faire passer pour un opérateur en utilisant le
/// drapeau '`o`' ou '`O`', la tentative devrait être ignorée car les
/// utilisateurs pourraient contourner les mécanismes d'authentification de la
/// commande `/OPER`. Il n'y a cependant aucune restriction à ce qu'un opérateur
/// se "dé-op" lui-même (en utilisant '`-o`' ou '`-O`').
pub const USER_FLAG_GLOBAL_OPERATOR: char = 'o';

/// Drapeau '`O`': utilisateur marqué comme opérateur local
/// ([Flag::LocalOperator]).
///
/// Si un utilisateur tente de se faire passer pour un opérateur en utilisant le
/// drapeau '`o`' ou '`O`', la tentative devrait être ignorée car les
/// utilisateurs pourraient contourner les mécanismes d'authentification de la
/// commande `/OPER`. Il n'y a cependant aucune restriction à ce qu'un opérateur
/// se "dé-op" lui-même (en utilisant '`-o`' ou '`-O`').
pub const USER_FLAG_LOCAL_OPERATOR: char = 'O';

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(PartialEq, Eq, Hash)]
pub enum Flag
{
	/// Permet de marquer l'utilisateur comme étant absent.
	#[serde(skip_serializing)]
	Away(
		/// Texte d'absence.
		String,
	),

	/// Opérateur global.
	GlobalOperator,
	/// Opérateur local.
	LocalOperator,
}

// -------------- //
// Implémentation //
// -------------- //

impl Flag
{
	pub fn letter(&self) -> char
	{
		match self {
			| Flag::Away(_) => USER_FLAG_AWAY,
			| Flag::GlobalOperator => USER_FLAG_GLOBAL_OPERATOR,
			| Flag::LocalOperator => USER_FLAG_LOCAL_OPERATOR,
		}
	}
}
