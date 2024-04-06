// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::Result;

// ---- //
// Type //
// ---- //

type LValue<'a> = &'a str;
type RValue<'a> = &'a str;

// --------- //
// Structure //
// --------- //

#[derive(Debug)]
#[derive(PartialEq, Eq)]
pub(crate) struct Declaration<'a>(pub(crate) LValue<'a>, pub(crate) RValue<'a>);

// -------------- //
// Implémentation //
// -------------- //

impl<'a> Declaration<'a>
{
	/// Analyse d'une déclaration de variable `VAR=[value]`
	pub(crate) fn parse<'b: 'a>(input: &'b str) -> Result<Self>
	{
		input
			.split_once('=')
			.filter(|(key, _)| key.to_ascii_uppercase().eq(key))
			.map(|(key, value)| Self(key, value))
			.ok_or(crate::Error::ParseLineDeclaration)
	}
}

// ---- //
// Test //
// ---- //

#[cfg(test)]
mod tests
{
	use super::*;

	#[test]
	fn test_parse_empty_value()
	{
		let decl = Declaration::parse("A=").expect("?");
		assert_eq!(decl.0, "A");
		assert_eq!(decl.1, "");
	}

	#[test]
	fn test_parse_key_value()
	{
		let decl = Declaration::parse("A=B").expect("?");
		assert_eq!(decl.0, "A");
		assert_eq!(decl.1, "B");
	}

	#[test]
	fn test_parse_multiple_eq_sign()
	{
		let decl = Declaration::parse("A=B=C=D").expect("?");
		assert_eq!(decl.0, "A");
		assert_eq!(decl.1, "B=C=D");
	}
}
