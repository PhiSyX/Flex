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

use flex_crypto::EncryptionCtor;

use crate::ExtensionInterface;

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
pub struct SecurityEncryptionService<T>
{
	encryption: T,
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<T> ExtensionInterface for SecurityEncryptionService<T>
where
	T: EncryptionCtor + Clone + Send + Sync + 'static,
{
	type Payload = String;

	fn new(payload: Self::Payload) -> Self
	{
		Self {
			encryption: T::new(payload),
		}
	}
}

impl<T> ops::Deref for SecurityEncryptionService<T>
{
	type Target = T;

	fn deref(&self) -> &Self::Target
	{
		&self.encryption
	}
}
