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
use std::sync::Arc;

use flex_web_framework::types::{email, secret};
use flex_web_framework::FeatureConfig;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfig
{
	/// Configuration utilisateur du réseau.
	pub network: FlexChatConfigNetwork,
	/// Configuration utilisateur des informations d'administration du serveur.
	pub admin: FlexChatConfigAdmin,
	/// Configuration du serveur.
	pub server: FlexChatConfigServer,
	/// Configuration globale liée aux opérateurs du serveur, pour chaque
	/// opérateur.
	pub operator: FlexChatConfigOperator,
	/// Configuration des opérateurs globaux du serveur.
	#[serde(default)]
	pub operators: Vec<FlexChatConfigOperatorAuth>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfigNetwork
{
	/// Nom du réseau du serveur de Chat.
	pub name: Arc<str>,
	/// Description du réseau du serveur de Chat.
	#[serde(default)]
	pub description: Option<Arc<str>>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfigAdmin
{
	/// Nom de l'administrateur du serveur de Chat.
	pub name: Arc<str>,
	/// Adresse mail de l'administrateur du serveur de Chat.
	pub email: email::EmailAddress,
	/// Pseudonyme de l'administrateur du serveur de Chat.
	#[serde(default)]
	pub nick: Option<Arc<str>>,
	/// Description de l'administrateur du serveur de Chat.
	#[serde(default)]
	pub description: Option<Arc<str>>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfigServer
{
	/// Nom d'hôte du serveur.
	///
	/// La valeur de ce champ sert à s'afficher dans les messages de connexion
	/// au serveur pour le client.
	pub name: Arc<str>,
	/// Le mot de passe du serveur, qui DOIT être chiffré hein ;-).
	pub password: Option<secret::Secret<Arc<str>>>,
	/// Date de création du serveur.
	pub created_at: Option<i64>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfigOperator
{
	pub auto_join: Vec<Arc<str>>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct FlexChatConfigOperatorAuth
{
	/// Identifiant de l'opérateur.
	pub identifier: secret::Secret<Arc<str>>,
	/// Mot de passe de l'opérateur (chiffré).
	pub password: secret::Secret<Arc<str>>,
	/// Type d'opérateur.
	#[serde(rename = "type")]
	pub oper_type: FlexChatConfigOperatorType,
	/// Hôte virtuel.
	#[serde(rename = "vhost")]
	pub virtual_host: Option<Arc<str>>,
	/// Drapeau par défaut à appliquer automatiquement.
	#[serde(default)]
	pub flags: HashSet<FlexChatConfigOperatorFlags>,
}

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub enum FlexChatConfigOperatorType
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
pub enum FlexChatConfigOperatorFlags
{
	/// Opérateur non sanctionable d'un KICK sur un salon.
	NoKick,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl FeatureConfig for FlexChatConfig
{
	const FILENAME: &'static str = "chat";
}
