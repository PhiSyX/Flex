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
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(remote = "Self")]
pub struct AccountUpdateFormData
{
	#[serde(skip_serializing_if = "Option::is_none")]
	pub firstname: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub lastname: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub gender: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub country: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub city: Option<String>,
}

impl<'de> serde::Deserialize<'de> for AccountUpdateFormData
{
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let mut this = Self::deserialize(deserializer)?;

		this.city = this.city.map(strip_tags);
		this.country = this.country.map(strip_tags);
		this.firstname = this.firstname.map(strip_tags);
		this.lastname = this.lastname.map(strip_tags);
		this.gender = this.gender.map(strip_tags);

		Ok(this)
	}
}

fn strip_tags(s: String) -> String
{
	let re = regex::Regex::new("(<([^>]+)>)").unwrap();
	String::from(re.replace_all(&s, ""))
}
