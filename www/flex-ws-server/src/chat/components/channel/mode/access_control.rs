// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use std::collections::HashMap;
use std::fmt;

use crate::src::chat::features::ApplyMode;

// -------- //
// Constant //
// -------- //

pub const CHANNEL_MODE_LIST_BAN: char = 'b';

// --------- //
// Structure //
// --------- //

#[derive(Clone)]
#[derive(Default)]
#[derive(Debug)]
pub struct AccessControl
{
	pub banlist: HashMap<String, ApplyMode<AccessControlMode>>,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct AccessControlMode
{
	pub mask: Mask,
}

#[derive(Debug)]
#[derive(Clone)]
#[derive(PartialEq, Eq, Hash)]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct Mask
{
	nick: String,
	ident: String,
	host: String,
}

// -------------- //
// Implémentation //
// -------------- //

impl AccessControlMode
{
	pub fn new(mask: Mask) -> Self
	{
		Self { mask }
	}
}

impl AccessControl
{
	pub fn add_ban(
		&mut self,
		mask: impl Into<Mask>,
		mode: ApplyMode<AccessControlMode>,
	) -> Option<ApplyMode<AccessControlMode>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();

		if self.banlist.contains_key(&mask_key) {
			return None;
		}

		self.banlist.insert(mask_key, mode.clone());

		Some(mode)
	}

	pub fn remove_ban(&mut self, mask: impl Into<Mask>) -> Option<ApplyMode<AccessControlMode>>
	{
		let mask = mask.into();
		let mask_key = mask.to_string();
		self.banlist.remove(&mask_key)
	}
}

impl Mask
{
	pub fn generic() -> Self
	{
		Self {
			nick: String::from("*"),
			ident: String::from("*"),
			host: String::from("*"),
		}
	}

	/// Analyse d'un ident.
	//
	// ```bnf
	// input :: < '!' [ mask ] >
	// mask  :: [ ident [ '@' [ host ]]]
	// ```
	//
	// EXAMPLE(1): "!" 				-> "*!*@*"
	// EXAMPLE(2): "!ident@host"	-> "*!ident@host"
	// EXAMPLE(3): "!@"				-> "*!*@*"
	// EXAMPLE(4): "!ident"			-> "*!ident@*"
	fn parse_ident(mask: &str) -> Self
	{
		let maybe_ident_maybe_host = mask.trim_start_matches('!');

		// NOTE: 2 / 3
		// NOTE: après le split, l'ident et l'hôte PEUVENT être vide.
		let (mut maybe_ident, mut maybe_host) = maybe_ident_maybe_host.split_once('@').unwrap_or(
			// NOTE: cela veut dire que nous dans le cas 4, l'hôte n'est pas définit.
			(maybe_ident_maybe_host, "*"),
		);

		if maybe_ident.is_empty() {
			maybe_ident = "*";
		}

		if maybe_host.is_empty() {
			maybe_host = "*";
		}

		Self {
			nick: String::from("*"),
			ident: String::from(maybe_ident),
			host: String::from(maybe_host),
		}
	}

	/// Analyse d'un hôte.
	//
	// ```bnf
	// input :: < '@' [ mask ] >
	// mask  :: [ host ]
	// ```
	//
	// EXAMPLE(1): "@" 		-> "*!*@*"
	// EXAMPLE(2): "@host"	-> "*!*@host"
	fn parse_host(mask: &str) -> Self
	{
		let mut maybe_host = mask.trim_start_matches('@');

		if maybe_host.is_empty() {
			maybe_host = "*";
		}

		Self {
			nick: String::from("*"),
			ident: String::from("*"),
			host: String::from(maybe_host),
		}
	}

	/// Analyse d'un pseudo.
	//
	// ```bnf
	// input :: < [ mask ] '!' >
	// mask  :: [ nick [ '!' ]]
	// ```
	//
	// EXAMPLE(1): "nick"	-> "nick!*@*"
	// EXAMPLE(2): "nick!"	-> "nick!*@*"
	// EXAMPLE(3): "!"		-> "*!*@*"
	fn parse_nick(mask: &str) -> Self
	{
		let mut maybe_nick = mask.trim_end_matches('!');

		if maybe_nick.is_empty() {
			maybe_nick = "*";
		}

		Self {
			nick: String::from(maybe_nick),
			ident: String::from("*"),
			host: String::from("*"),
		}
	}

	/// Analyse d'un pseudo + ident.
	//
	// ```bnf
	// input :: < [ mask ] '@' >
	// mask  :: [ nick [ '!' [ ident ]]]
	// ```
	//
	// EXAMPLE(1): "nick!ident"		-> "nick!ident@*"
	// EXAMPLE(2): "nick!ident@"	-> "nick!ident@*"
	// EXAMPLE(3): "ident@"			-> "*!ident@*"
	// EXAMPLE(4): "@"				-> "*!*@*"
	fn parse_nick_and_ident(mask: &str) -> Self
	{
		let maybe_nick_maybe_ident = mask.trim_end_matches('@');

		let (mut maybe_nick, mut maybe_ident) = maybe_nick_maybe_ident
			.split_once('!')
			.unwrap_or(("*", maybe_nick_maybe_ident));

		if maybe_nick.is_empty() {
			maybe_nick = "*";
		}

		if maybe_ident.is_empty() {
			maybe_ident = "*";
		}

		Self {
			nick: String::from(maybe_nick),
			ident: String::from(maybe_ident),
			host: String::from("*"),
		}
	}

	/// Analyse d'un pseudo + ident + hôte.
	//
	// ```bnf
	// input :: < [ mask ] >
	// mask  :: [ nick [ '!' [ ident '@' [ host ]]]]
	// ```
	//
	// EXAMPLE(1): "nick!ident@host"	-> "nick!ident@host"
	// EXAMPLE(2): "nick!ident@"		-> "nick!ident@*"
	// EXAMPLE(3): "!@"					-> "*!*@*"
	fn parse_nick_and_ident_and_host(mask: &str) -> Self
	{
		let maybe_nick_maybe_ident = mask;

		let (mut maybe_nick, maybe_ident_maybe_host) = maybe_nick_maybe_ident
			.split_once('!')
			.unwrap_or(("*", maybe_nick_maybe_ident));

		if maybe_nick.is_empty() {
			maybe_nick = "*";
		}

		let (mut maybe_ident, mut maybe_host) = maybe_ident_maybe_host
			.split_once('@')
			.unwrap_or((maybe_ident_maybe_host.trim_end_matches('@'), "*"));

		if maybe_ident.is_empty() {
			maybe_ident = "*";
		}

		if maybe_host.is_empty() {
			maybe_host = "*";
		}

		Self {
			nick: String::from(maybe_nick),
			ident: String::from(maybe_ident),
			host: String::from(maybe_host),
		}
	}

	/// Analyse d'un mask entier.
	fn parse_mask(input: &str) -> Self
	{
		if !input.contains('!') && !input.contains('@') {
			return Self::parse_nick(input);
		}

		if input.contains('!') && !input.contains('@') {
			return Self::parse_nick_and_ident(input);
		}

		if !input.contains('!') && input.contains('@') {
			return Self::parse_host(input);
		}

		if input.contains('!') && input.contains('@') {
			return Self::parse_nick_and_ident_and_host(input);
		}

		Self {
			nick: String::from("*"),
			ident: String::from("*"),
			host: String::from("*"),
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<S> From<S> for Mask
where
	S: AsRef<str>,
{
	fn from(s: S) -> Self
	{
		let mask = s.as_ref();

		if mask.eq("*") || mask.eq("!") || mask.eq("@") || mask.eq("!@") || mask.eq("@!") {
			return Self::generic();
		}

		if mask.starts_with('!') {
			return Self::parse_ident(mask);
		}

		if mask.ends_with('!') {
			return Self::parse_nick(mask);
		}

		if mask.starts_with('@') {
			return Self::parse_host(mask);
		}

		if mask.ends_with('@') && !mask[..mask.len() - 1].contains('@') {
			return Self::parse_nick_and_ident(mask);
		}

		Self::parse_mask(mask)
	}
}

impl fmt::Display for Mask
{
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result
	{
		write!(f, "{}!{}@{}", self.nick, self.ident, self.host)
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
	fn test_parse_ident()
	{
		let mask = Mask::parse_ident("!").to_string();
		assert_eq!(mask, "*!*@*");
		let mask = Mask::parse_ident("!ident@host").to_string();
		assert_eq!(mask, "*!ident@host");
		let mask = Mask::parse_ident("!@").to_string();
		assert_eq!(mask, "*!*@*");
		let mask = Mask::parse_ident("!ident").to_string();
		assert_eq!(mask, "*!ident@*");
	}

	#[test]
	fn test_parse_host()
	{
		let mask = Mask::parse_host("@").to_string();
		assert_eq!(mask, "*!*@*");
		let mask = Mask::parse_host("@host").to_string();
		assert_eq!(mask, "*!*@host");
	}

	#[test]
	fn test_parse_nick()
	{
		let mask = Mask::parse_nick("nick").to_string();
		assert_eq!(mask, "nick!*@*");
		let mask = Mask::parse_nick("nick!").to_string();
		assert_eq!(mask, "nick!*@*");
		let mask = Mask::parse_nick("!").to_string();
		assert_eq!(mask, "*!*@*");
	}

	#[test]
	fn test_parse_nick_and_ident()
	{
		let mask = Mask::parse_nick_and_ident("nick!ident").to_string();
		assert_eq!(mask, "nick!ident@*");
		let mask = Mask::parse_nick_and_ident("nick!ident@").to_string();
		assert_eq!(mask, "nick!ident@*");
		let mask = Mask::parse_nick_and_ident("ident@").to_string();
		assert_eq!(mask, "*!ident@*");
		let mask = Mask::parse_nick_and_ident("@").to_string();
		assert_eq!(mask, "*!*@*");
	}

	#[test]
	fn test_parse_nick_and_ident_and_host()
	{
		let mask = Mask::parse_nick_and_ident_and_host("nick!ident@host").to_string();
		assert_eq!(mask, "nick!ident@host");
		let mask = Mask::parse_nick_and_ident_and_host("nick!ident@").to_string();
		assert_eq!(mask, "nick!ident@*");
		let mask = Mask::parse_nick_and_ident_and_host("!@").to_string();
		assert_eq!(mask, "*!*@*");
	}

	#[test]
	fn test_parse_mask()
	{
		let mask = Mask::parse_mask("nick").to_string();
		assert_eq!(mask, "nick!*@*");
		let mask = Mask::parse_mask("nick!ident").to_string();
		assert_eq!(mask, "nick!ident@*");
		let mask = Mask::parse_mask("nick!ident@host").to_string();
		assert_eq!(mask, "nick!ident@host");
	}

	#[test]
	fn test_parse_mask_from()
	{
		assert!(Mask::from("*") == Mask::from("*!*@*"));
		assert!(Mask::from("!") == Mask::from("*!*@*"));
		assert!(Mask::from("@") == Mask::from("*!*@*"));

		assert!(Mask::from("nick") == Mask::from("nick!*@*"));
		assert!(Mask::from("nick!") == Mask::from("nick!*@*"));

		assert!(Mask::from("ident@") == Mask::from("*!ident@*"));
		assert!(Mask::from("!ident") == Mask::from("*!ident@*"));
		assert!(Mask::from("!ident!") == Mask::from("*!ident!@*"));
		assert!(Mask::from("!ident@") == Mask::from("*!ident@*"));
		assert!(Mask::from("!ident@host") == Mask::from("*!ident@host"));

		assert!(Mask::from("@host") == Mask::from("*!*@host"));
		assert!(Mask::from("@host@") == Mask::from("*!*@host@"));

		assert!(Mask::from("nick!ident") == Mask::from("nick!ident@*"));
		assert!(Mask::from("nick!ident@host") == Mask::from("nick!ident@host"));
	}
}
