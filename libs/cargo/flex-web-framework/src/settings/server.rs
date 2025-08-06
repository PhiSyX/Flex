// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::{net, path};

use crate::types::port;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct Settings
{
	/// IP de connexion du serveur HTTP à ouvrir.
	pub ip: net::IpAddr,
	/// Le port de connexion du serveur associé à l'IP
	pub port: port::Port,
	/// Paramètre TLS du serveur.
	pub tls: Option<TlsSettings>,
	/// Ressources statiques du serveur.
	pub static_resources: Vec<StaticResourceSettings>,
}

#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct TlsSettings
{
	#[serde(rename = "cert")]
	pub cert_file: path::PathBuf,
	#[serde(rename = "key")]
	pub key_file: path::PathBuf,
}

#[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct StaticResourceSettings
{
	/// Un chemin d'URL accessible aux clients HTTP.
	pub url_path: String,
	/// Un répertoire de ressources statiques que doit servir le serveur HTTP.
	pub dir_path: path::PathBuf,
}

// -------------- //
// Implémentation //
// -------------- //

impl Settings
{
	pub const FILENAME: &'static str = "server";

	pub fn socket_addr(&self) -> net::SocketAddr
	{
		net::SocketAddr::from((self.ip, u16::from(self.port)))
	}

	/// Résolution du nom d'hôte à partir de l'adresse IP
	pub fn hostname(&self) -> String
	{
		if self.ip == std::net::Ipv4Addr::LOCALHOST {
			String::from("localhost")
		} else {
			dns_lookup::lookup_addr(&self.ip)
				.unwrap_or(String::from("localhost"))
		}
	}

	pub fn protocol(&self) -> &str
	{
		if self.tls.is_some() { "https" } else { "http" }
	}

	pub fn http_url(&self) -> String
	{
		format!("{}://{}:{}", self.protocol(), self.hostname(), self.port)
	}

	pub fn url(&self) -> url::Url
	{
		self.http_url().parse().unwrap()
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Default for Settings
{
	fn default() -> Self
	{
		Self {
			ip: net::IpAddr::V4(net::Ipv4Addr::new(127, 0, 0, 1)),
			port: port::Port::from(80),
			tls: Default::default(),
			static_resources: Default::default(),
		}
	}
}
