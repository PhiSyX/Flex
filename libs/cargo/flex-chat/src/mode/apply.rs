// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::ops;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Debug)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct ApplyMode<F>
{
	/// Drapeau d'un mode.
	pub flag: F,
	/// Les arguments d'un drapeau.
	pub args: Vec<String>,
	/// Par qui a été appliqué ce mode.
	pub updated_by: String,
	/// Quand a été appliqué ce mode.
	pub updated_at: chrono::DateTime<chrono::Utc>,
}

// -------------- //
// Implémentation //
// -------------- //

impl<F> ApplyMode<F>
{
	pub fn new(flag: F) -> Self
	{
		Self {
			args: Default::default(),
			flag,
			updated_at: chrono::Utc::now(),
			updated_by: String::from("*"),
		}
	}

	pub fn with_args(mut self, args: impl IntoIterator<Item = String>) -> Self
	{
		self.args = args.into_iter().collect();
		self
	}

	pub fn with_update_by(mut self, by: impl ToString) -> Self
	{
		self.updated_by = by.to_string();
		self
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<F> ops::Deref for ApplyMode<F>
{
	type Target = F;

	fn deref(&self) -> &Self::Target
	{
		&self.flag
	}
}
