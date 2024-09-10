// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use argon2::{
	Algorithm,
	Argon2,
	ParamsBuilder,
	PasswordHash,
	PasswordHasher,
	PasswordVerifier,
	Version,
};
use flex_crypto::{Hasher, HasherCtor};

use crate::security::SecurityPasswordHasherService;

// ---- //
// Type //
// ---- //

pub type Argon2Password = SecurityPasswordHasherService<Argon2PasswordHasher>;
pub type Argon2PasswordError = argon2::password_hash::Error;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct Argon2PasswordHasher
{
	secret: std::sync::Arc<str>,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl HasherCtor for Argon2PasswordHasher
{
	fn new(secret: impl Into<std::sync::Arc<str>>) -> Self
	{
		Self {
			secret: secret.into(),
		}
	}
}

impl Hasher for Argon2PasswordHasher
{
	type Err = Argon2PasswordError;

	fn cmp(&self, secret: impl AsRef<str>, input: impl AsRef<str>) -> bool
	{
		let algorithm = Algorithm::Argon2id;
		let version = Version::V0x13;

		let Ok(params) = ParamsBuilder::new().build() else {
			return false;
		};

		let Ok(argon2_hasher) = Argon2::new_with_secret(
			self.secret.as_bytes(),
			algorithm,
			version,
			params,
		) else {
			return false;
		};

		let Ok(password_hasher) = PasswordHash::new(secret.as_ref()) else {
			return false;
		};

		argon2_hasher
			.verify_password(input.as_ref().as_bytes(), &password_hasher)
			.is_ok()
	}

	fn hash(&self, input: impl AsRef<str>) -> Result<String, Self::Err>
	{
		let algorithm = Algorithm::Argon2id;
		let version = Version::V0x13;
		let params = ParamsBuilder::new().build()?;
		let argon2_hasher = Argon2::new_with_secret(
			self.secret.as_bytes(),
			algorithm,
			version,
			params,
		)?;
		let salt = SaltString::generate(&mut OsRng);
		let encoded =
			argon2_hasher.hash_password(input.as_ref().as_bytes(), &salt)?;
		Ok(encoded.to_string())
	}

	fn verify(&self, input: impl AsRef<str>) -> bool
	{
		self.cmp(&self.secret, input)
	}
}
