// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashSet;

use flex_chat_channel::validate_channels;
use flex_web_framework::types::{email, secret};
use flex_web_framework::FeatureConfig;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config
{
	/// Configuration utilisateur du réseau.
	pub network: flex_config_network,
	/// Configuration utilisateur des informations d'administration du serveur.
	pub admin: flex_config_admin,
	/// Configuration du serveur.
	pub server: flex_config_server,
	/// Configuration globale liée aux opérateurs du serveur, pour chaque
	/// opérateur.
	pub operator: flex_config_operator,
	/// Configuration des opérateurs globaux du serveur.
	#[serde(default)]
	pub operators: Vec<flex_config_operator_auth>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config_network
{
	/// Nom du réseau du serveur de Chat.
	pub name: String,
	/// Description du réseau du serveur de Chat.
	#[serde(default)]
	pub description: Option<String>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config_admin
{
	/// Nom de l'administrateur du serveur de Chat.
	pub name: String,
	/// Adresse mail de l'administrateur du serveur de Chat.
	pub email: email::EmailAddress,
	/// Pseudonyme de l'administrateur du serveur de Chat.
	#[serde(default)]
	pub nick: Option<String>,
	/// Description de l'administrateur du serveur de Chat.
	#[serde(default)]
	pub description: Option<String>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config_server
{
	/// Nom d'hôte du serveur.
	///
	/// La valeur de ce champ sert à s'afficher dans les messages de connexion
	/// au serveur pour le client.
	pub name: String,
	/// Le mot de passe du serveur, qui DOIT être chiffré hein ;-).
	pub password: Option<secret::Secret<String>>,
	/// Date de création du serveur.
	pub created_at: Option<i64>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config_operator
{
	#[serde(deserialize_with = "validate_channels")]
	pub auto_join: Vec<String>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct flex_config_operator_auth
{
	/// Identifiant de l'opérateur.
	pub identifier: secret::Secret<String>,
	/// Mot de passe de l'opérateur (chiffré).
	pub password: secret::Secret<String>,
	/// Type d'opérateur.
	#[serde(rename = "type")]
	pub oper_type: flex_config_operator_type,
	/// Hôte virtuel.
	#[serde(rename = "vhost")]
	pub virtual_host: Option<String>,
	/// Drapeau par défaut à appliquer automatiquement.
	#[serde(default)]
	pub flags: HashSet<flex_config_operator_flags>,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub enum flex_config_operator_type
{
	/// Opérateur local
	LocalOperator,
	/// Opérateur Global
	GlobalOperator,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
#[derive(PartialEq, Eq, Hash)]
pub enum flex_config_operator_flags
{
	/// Opérateur non kickable.
	NoKick,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FeatureConfig for flex_config
{
	const FILENAME: &'static str = "flex";
}
