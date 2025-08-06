// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2023, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ----- //
// Trait //
// ----- //

pub trait WildcardMatching: AsRef<str>
{
	/// Compare deux chaînes de caractères avec l'utilisation de caractères
	/// génériques.
	///
	/// Les caractères génériques sont des caractères spéciaux, comme '*'
	/// ou '?'.
	///   - '*' : correspond à aucun caractère ou plusieurs caractères,
	///     n'importe lesquels.
	///   - '?' : correspond à un seul caractère, n'importe lequel.
	///
	/// wm = Wildcard Matching
	#[inline]
	fn iswm(&self, pattern: &str) -> bool
	{
		let build_regexp =
			regex::escape(pattern).replace(r"\?", ".").replace(r"\*", ".*");

		let regexp = regex::RegexBuilder::new(&build_regexp)
			.case_insensitive(true)
			.build()
			.unwrap();

		regexp.is_match(self.as_ref())
	}

	/// Compare deux chaînes de caractères avec l'utilisation de caractères
	/// génériques.
	///
	/// Les caractères génériques sont des caractères spéciaux, comme '*'
	/// ou '?'.
	///   - '*' : correspond à aucun caractère ou plusieurs caractères,
	///     n'importe lesquels.
	///   - '?' : correspond à un seul caractère, n'importe lequel.
	///
	/// wm = Wildcard Matching
	/// cs = Case Sensitive
	#[inline]
	fn iswmcs(&self, pattern: &str) -> bool
	{
		let build_regexp =
			regex::escape(pattern).replace(r"\?", ".").replace(r"\*", ".*");

		let regexp = regex::RegexBuilder::new(&build_regexp)
			.case_insensitive(false)
			.build()
			.unwrap();

		regexp.is_match(self.as_ref())
	}

	/// Compare deux chaînes de caractères avec l'utilisation de caractères
	/// génériques et retourne le résultat.
	///
	/// Les caractères génériques sont des caractères spéciaux, comme '*'
	/// ou '?'.
	///   - '*' : correspond à aucun caractère ou plusieurs caractères,
	///     n'importe lesquels.
	///   - '?' : correspond à un seul caractère, n'importe lequel.
	///
	/// wm = Wildcard Matching
	#[inline]
	fn wildcard_match<'a>(&'a self, pattern: &str) -> Option<&'a str>
	{
		let build_regexp =
			regex::escape(pattern).replace(r"\?", ".").replace(r"\*", ".*");

		let regexp = regex::RegexBuilder::new(&build_regexp)
			.case_insensitive(true)
			.build()
			.unwrap();

		regexp
			.captures(self.as_ref())
			.and_then(|captures| captures.get(0).map(|m| m.as_str()))
	}

	/// Compare deux chaînes de caractères avec l'utilisation de caractères
	/// génériques et retourne le résultat.
	///
	/// Les caractères génériques sont des caractères spéciaux, comme '*'
	/// ou '?'.
	///   - '*' : correspond à aucun caractère ou plusieurs caractères,
	///     n'importe lesquels.
	///   - '?' : correspond à un seul caractère, n'importe lequel.
	fn wildcard_match_case_sensitive<'a>(
		&'a self,
		pattern: &str,
	) -> Option<&'a str>
	{
		let build_regexp =
			regex::escape(pattern).replace(r"\?", ".").replace(r"\*", ".*");

		let regexp = regex::RegexBuilder::new(&build_regexp)
			.case_insensitive(false)
			.build()
			.unwrap();

		regexp
			.captures(self.as_ref())
			.and_then(|captures| captures.get(0).map(|m| m.as_str()))
	}
}
