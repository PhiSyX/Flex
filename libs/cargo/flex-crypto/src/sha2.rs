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

use ::sha2::Digest;

// --------- //
// Interface //
// --------- //

pub trait SHA256: AsRef<str>
{
	fn sha256(&self) -> String
	{
		let mut hash = ::sha2::Sha256::new();
		hash.update(self.as_ref());
		let slice_bytes = hash.finalize();
		format!("{slice_bytes:X}")
	}

	fn sha256_sliced(&self, rng: ops::Range<usize>) -> String
	{
		let hash = self.sha256();
		hash.get(rng).unwrap_or(&hash).to_owned()
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> SHA256 for S where S: AsRef<str> {}

// ---- //
// Test //
// ---- //

#[cfg(test)]
mod tests
{
	use super::*;

	#[test]
	fn test_sha256()
	{
		let raw_text = "test";
		assert_eq!(
			raw_text.sha256(),
			"9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08"
		);
	}

	#[test]
	fn test_sha256_sliced()
	{
		assert_eq!("test".sha256_sliced(10..20), "4C7D659A2F");
	}
}
