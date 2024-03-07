// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::borrow::Cow;
use std::{fmt, net};

use flex_crypto::SHA256;
use flex_secret::Secret;

// --------- //
// Structure //
// --------- //

/// Informations concernant l'adresse IP d'un utilisateur.
///
/// Exemple pour l'IP suivante : `3.xx.15x.x2` (fake ip)
/// - `cloaked` = `96599102.eu-central-1.compute.amazonaws.com` ;
/// - `raw`     = `ec2-3-xx-15x-x2.eu-central-1.compute.amazonaws.com` ;
#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct Host
{
	/// Adresse IP du client.
	#[serde(skip_serializing)]
	pub ip_addr: Secret<net::IpAddr>,
	/// Nom d'hôte masqué de l'adresse IP.
	pub cloaked: String,
	/// Nom d'hôte virtuel (perso) de l'utilisateur.
	#[serde(rename = "vhost", skip_serializing_if = "Option::is_none")]
	pub virtual_host: Option<String>,
}

// -------------- //
// Implémentation //
// -------------- //

impl Host
{
	/// Crée un [hôte](Host) à partir d'une adresse IP, si celle-ci n'est pas
	/// valide, l'adresse IP est remplacée par l'adresse IP de l'hôte local
	/// (`127.0.0.1`).
	pub fn new(ip_addr: net::IpAddr) -> Self
	{
		let resolve_addr =
			dns_lookup::lookup_addr(&ip_addr).unwrap_or_else(|_| String::from("localhost"));

		let cloaked = Self::get_cloaked_ip(&resolve_addr);

		Self {
			ip_addr: Secret::new(ip_addr),
			cloaked,
			virtual_host: Default::default(),
		}
	}
}

impl Host
{
	/// Définit un nouvel hôte virtuel.
	pub fn set_vhost(&mut self, vhost: impl ToString)
	{
		self.virtual_host.replace(vhost.to_string());
	}
}

impl Host
{
	/// Génère un nom d'hôte à partir de l'adresse IP.
	fn get_cloaked_ip(hostname: &str) -> String
	{
		hostname
			.split('.')
			.map(|part: &str| -> Cow<str> {
				if part.contains(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
					let parsed: Result<u8, _> = part.parse();
					if parsed.is_err() {
						return Cow::Owned(part.sha256_sliced(0..part.len()));
					}
				}
				Cow::Borrowed(part)
			})
			.collect::<Vec<Cow<str>>>()
			.join(".")
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl From<net::IpAddr> for Host
{
	fn from(ip: net::IpAddr) -> Self
	{
		Self::new(ip)
	}
}

impl fmt::Display for Host
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		if let Some(virtual_host) = self.virtual_host.as_ref() {
			return write!(f, "{virtual_host}");
		}
		write!(f, "{}", self.cloaked)
	}
}

impl Default for Host
{
	fn default() -> Self
	{
		Self {
			ip_addr: Secret::new(net::IpAddr::V4(net::Ipv4Addr::LOCALHOST)),
			cloaked: Default::default(),
			virtual_host: Default::default(),
		}
	}
}
