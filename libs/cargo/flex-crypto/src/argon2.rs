// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::{Encryption, EncryptionCtor};

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct Argon2Encryption
{
	secret: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl EncryptionCtor for Argon2Encryption
{
	fn new(secret: impl ToString) -> Self
	{
		Self {
			secret: secret.to_string(),
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl Encryption for Argon2Encryption
{
	type Err = Box<dyn std::error::Error + Send + Sync>;

	fn encrypt(&self, input: impl AsRef<str>) -> Result<String, Self::Err>
	{
		let config = argon2::Config {
			variant: argon2::Variant::Argon2id,
			thread_mode: argon2::ThreadMode::Parallel,
			version: argon2::Version::Version13,
			..Default::default()
		};

		let encoded =
			argon2::hash_encoded(input.as_ref().as_bytes(), self.secret.as_bytes(), &config)?;

		Ok(encoded)
	}

	fn verify(&self, input: impl AsRef<str>) -> bool
	{
		self.cmp(&self.secret, input)
	}

	fn cmp(&self, secret: impl AsRef<str>, input: impl AsRef<str>) -> bool
	{
		let Ok(b) = argon2::verify_encoded(secret.as_ref(), input.as_ref().as_bytes()) else {
			return false;
		};

		b
	}
}
