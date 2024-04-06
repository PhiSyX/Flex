// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use core::{fmt, num, ops, str};

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Deserialize, serde::Serialize)]
pub struct Port(pub u16);

// -------------- //
// Implémentation //
// -------------- //

impl Port
{
	const MAX_USER_PORT: u16 = 49151;
	const MIN_USER_PORT: u16 = 1024;

	/// Le port au format u16.
	pub fn to_u16(self) -> u16
	{
		self.0
	}

	/// Les numéros de port sont attribués de différentes manières, sur la base
	/// de trois gammes :
	///
	/// - Ports systèmes (0..1023)
	/// - Ports utilisateurs (1024..49151)
	/// - Ports dynamiques et/ou privés (49152..65535)
	///
	/// On ne veut pas que la configuration puisse définir un port qui
	/// correspond à un port système, ou un port dynamique/privé.
	pub fn is_valid(&self) -> bool
	{
		(Self::MIN_USER_PORT..=Self::MAX_USER_PORT).contains(&self.0)
	}

	/// Valide la valeur utilisateur: port réseau.
	/// La valeur DOIT être comprise entre [Self::MIN_USER_PORT] et
	/// [Self::MAX_USER_PORT].
	pub fn validate<'de, D: serde::Deserializer<'de>>(
		de: D,
	) -> Result<Self, D::Error>
	{
		use serde::Deserialize;

		Option::deserialize(de)
			// NOTE(phisyx): le port est invalide en deçà/au delà de `u16::MIN`
			//               ou `u16::MAX`
			.unwrap_or_default()
			.filter(|port: &Self| port.is_valid())
			.ok_or_else(|| {
				let message = format!(
					"Le port d'écoute est invalide. Il DOIT être compris \
					 entre « {} » et « {} ».",
					Self::MIN_USER_PORT,
					Self::MAX_USER_PORT
				);
				serde::de::Error::custom(message)
			})
	}

	#[inline]
	pub fn validate_option<'de, D: serde::Deserializer<'de>>(
		deserializer: D,
	) -> Result<Option<Self>, D::Error>
	{
		Self::validate(deserializer).map(Some)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl From<Port> for u16
{
	fn from(config: Port) -> Self
	{
		config.0
	}
}

impl From<u16> for Port
{
	fn from(port: u16) -> Self
	{
		Self(port)
	}
}

impl str::FromStr for Port
{
	type Err = num::ParseIntError;

	fn from_str(text: &str) -> Result<Self, Self::Err>
	{
		text.parse::<u16>().map(Self)
	}
}

impl ops::Deref for Port
{
	type Target = u16;

	fn deref(&self) -> &Self::Target
	{
		&self.0
	}
}

impl fmt::Display for Port
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(f, "{}", self.0)
	}
}

impl PartialEq<u16> for Port
{
	fn eq(&self, other: &u16) -> bool
	{
		self.0 == *other
	}
}
