// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(Clone)]
#[derive(serde::Deserialize)]
#[serde(remote = "Self")]
pub struct Settings
{
	pub domain: Option<String>,
	pub path: String,
	pub expires: Option<i64>,
	pub max_age: Option<i64>,
	pub http_only: Option<bool>,
	pub secure: Option<bool>,
	pub same_site: Option<SettingsSameSite>,
}

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Default)]
#[derive(Copy, Clone)]
#[derive(serde::Deserialize)]
pub enum SettingsSameSite
{
	Strict,
	#[default]
	Lax,
	None,
}

// -------------- //
// Implémentation //
// -------------- //

impl SettingsSameSite
{
	pub fn is_lax(&self) -> bool
	{
		matches!(self, Self::Lax)
	}

	pub fn is_none(&self) -> bool
	{
		matches!(self, Self::None)
	}

	pub fn is_strict(&self) -> bool
	{
		matches!(self, Self::Strict)
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'de> serde::Deserialize<'de> for Settings
{
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let mut this = Self::deserialize(deserializer)?;

		if let Some(SettingsSameSite::None) = this.same_site {
			if this.secure.filter(|b| *b).is_none() {
				return Err(serde::de::Error::custom(
					"[SettingsSameSite::None]: le paramètre `secure` DOIT \
					 être à `true` lorsque le paramètre `same_site` équivaut \
					 à la valeur `None`.",
				));
			}
		}

		if let Some(max_age) = this.max_age {
			if max_age < 3600 {
				this.max_age.replace(3600);
			}
		}

		Ok(this)
	}
}

impl From<SettingsSameSite> for tower_cookies::cookie::SameSite
{
	fn from(settings: SettingsSameSite) -> Self
	{
		match settings {
			| SettingsSameSite::Strict => Self::Strict,
			| SettingsSameSite::Lax => Self::Lax,
			| SettingsSameSite::None => Self::None,
		}
	}
}

impl Default for Settings
{
	fn default() -> Self
	{
		Self {
			domain: Default::default(),
			path: String::from("/"),
			expires: Default::default(),
			max_age: Some(7200),
			http_only: Some(true),
			secure: Some(true),
			same_site: Some(Default::default()),
		}
	}
}
