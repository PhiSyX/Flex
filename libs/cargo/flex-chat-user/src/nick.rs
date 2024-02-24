// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

/// Type de la longueur du pseudonyme utilisateur.
type InputNickSizeType = usize;

/// Type de la longueur d'un pseudonyme valide.
type NickSizeType = usize;

// --------- //
// Constante //
// --------- //

/// Les caractères spéciaux qu'un pseudonyme puisse avoir.
pub const NICK_SPECIAL_CHARS: [char; 9] = ['[', ']', '\\', '`', '_', '^', '{', '|', '}'];

/// La taille maximale d'un pseudonyme est de '`30`' caractères.
pub const NICK_MAX_SIZE: NickSizeType = 30;

// ----------- //
// Énumération //
// ----------- //

/// Ce que retourne les fonctions [do_nickname_with_config()], [do_nickname()]
/// en cas d'erreur.
#[derive(Debug)]
#[derive(PartialEq, Eq)]
pub enum Error
{
	/// La chaîne de caractères est vide.
	Empty,

	/// La chaîne de caractères contient des caractères invalides.
	InvalidCharacter(
		/// Le caractère invalide en question.
		char,
	),

	/// La chaîne de caractères commence par un caractère invalide.
	InvalidPrefix(
		/// Le préfixe invalide en question.
		char,
	),

	/// Le pseudonyme est réservé.
	ReservedNickname,
}

// -------- //
// Function //
// -------- //

// #[non_exhaustive]
pub struct DoNicknameFnOptions
{
	/// Configuration utilisateur sur la taille maximale qu'un pseudonyme
	/// puisse avoir.
	pub max_size: InputNickSizeType,
	/// Liste de pseudonymes réservés. Cette liste DOIT être en minuscule.
	pub reserved_list: Vec<String>,
}

/// Assure que l'argument `nickname` est vraiment un pseudonyme valide.
///
/// Pour qu'un pseudonyme soit considéré comme valide, ses caractères doivent
/// respecter le format décrit dans le schéma ci-haut et les conditions
/// suivantes :
///
///   - Il ne doit pas commencer par le caractère '-' ou par un caractère
///     numérique '0..9' ;
///   - Il peut contenir les caractères: alphanumériques, 'A..Z', 'a..z',
///     '0..9'. Les caractères alphabétiques des langues étrangères sont
///     considérés comme valides. Par exemple: le russe, le japonais, etc.
///   - Il peut contenir les caractères spéciaux suivants: []\`_^{|}
pub fn do_nickname_with_config(nickname: &str, options: DoNicknameFnOptions)
	-> Result<&str, Error>
{
	if nickname.trim().is_empty() {
		return Err(Error::Empty);
	}

	let nickname = nickname
		.char_indices()
		.nth(options.max_size)
		.and_then(|(i, _)| nickname.get(..i))
		.unwrap_or(nickname);

	let mut chars = nickname.chars();

	// SAFETY: la valeur de `nickname` ne peut pas être vide, elle à au
	//         moins 1 caractère, ce qui nous permet d'utiliser `unwrap`
	//         sereinement.
	let ch = chars.next().unwrap();

	if !is_first_char_valid(&ch) {
		return Err(Error::InvalidPrefix(ch));
	}

	for ch in chars {
		if !is_char_valid(&ch) {
			return Err(Error::InvalidCharacter(ch));
		}
	}

	let nickname_lwr = nickname.to_lowercase();
	if options.reserved_list.contains(&nickname_lwr) {
		return Err(Error::ReservedNickname);
	}

	Ok(nickname)
}

/// Équivalent de [do_nickname_with_config()] avec une configuration par
/// défaut.
pub fn do_nickname(nickname: &str) -> Result<&str, Error>
{
	do_nickname_with_config(
		nickname,
		DoNicknameFnOptions {
			max_size: NICK_MAX_SIZE,
			reserved_list: Default::default(),
		},
	)
}

/// Vérifie que le caractère passé en argument corresponde à un caractère :
///   - alphabétique ;
///   - [spécial](NICK_SPECIAL_CHARS) ;
///   - caractère '-' ;
pub(super) fn is_first_char_valid(ch: &char) -> bool
{
	ch.is_alphabetic() || NICK_SPECIAL_CHARS.contains(ch)
}

/// Vérifie que le caractère passé en argument corresponde à un caractère :
///   - alpha-numérique ;
///   - [spécial](NICK_SPECIAL_CHARS) ;
///   - caractère '-' ;
pub(super) fn is_char_valid(ch: &char) -> bool
{
	is_first_char_valid(ch) || ch.is_numeric() || '-'.eq(ch)
}

#[cfg(test)]
mod tests
{
	use super::*;

	#[test]
	fn should_not_be_empty()
	{
		let maybe_nickname = do_nickname("");
		assert_eq!(maybe_nickname, Err(Error::Empty));
	}

	#[test]
	fn must_not_start_with_invalid_chars()
	{
		let maybe_nickname = do_nickname("0slo");
		assert_eq!(maybe_nickname, Err(Error::InvalidPrefix('0')));

		let maybe_nickname = do_nickname("-PhiSyX");
		assert_eq!(maybe_nickname, Err(Error::InvalidPrefix('-')));
	}

	#[test]
	fn must_not_contain_invalid_chars()
	{
		let maybe_nickname = do_nickname("ありがとうございます。");
		assert_eq!(maybe_nickname, Err(Error::InvalidCharacter('。')));

		let maybe_nickname = do_nickname("i̵̓̐n̶͗͋j̷̐̏e̸̓̀c̴͂͘ẗ̸́͠ḭ̵̔o̶͚͛ń̴͘");
		assert_eq!(maybe_nickname, Err(Error::InvalidCharacter('\u{335}')));

		let maybe_nickname = do_nickname("er~or");
		assert_eq!(maybe_nickname, Err(Error::InvalidCharacter('~')));
	}

	#[test]
	fn should_not_exceed_x_characters()
	{
		let maybe_nickname = do_nickname("PhiSyX");
		assert_eq!(maybe_nickname, Ok("PhiSyX"));

		let nick = "a".repeat(40);
		let maybe_nickname = do_nickname(&nick);
		let nick_expect = "a".repeat(NICK_MAX_SIZE);
		assert_eq!(maybe_nickname, Ok(nick_expect.as_str()));
	}

	#[test]
	fn must_be_valid_nickname()
	{
		let maybe_nickname = do_nickname("PhiSyX");
		assert_eq!(maybe_nickname, Ok("PhiSyX"));

		let maybe_nickname = do_nickname("Mike_");
		assert_eq!(maybe_nickname, Ok("Mike_"));

		let maybe_nickname = do_nickname("フィジックス");
		assert_eq!(maybe_nickname, Ok("フィジックス"));

		let maybe_nickname = do_nickname("ありがとうございます");
		assert_eq!(maybe_nickname, Ok("ありがとうございます"));

		let maybe_nickname = do_nickname("αγάπη");
		assert_eq!(maybe_nickname, Ok("αγάπη"));

		let maybe_nickname = do_nickname("ПриветПриветПриветПривериветПриветПриветПриветПривет");
		assert_eq!(maybe_nickname, Ok("ПриветПриветПриветПривериветПр"));
	}

	#[test]
	fn check_if_valid_first_char()
	{
		assert!(is_first_char_valid(&'a'));
		assert!(!is_first_char_valid(&'1'));
		assert!(!is_first_char_valid(&'-'));
		assert!(is_first_char_valid(&'{'));
		assert!(!is_first_char_valid(&'\u{335}'));
	}

	#[test]
	fn check_if_valid_char()
	{
		assert!(is_char_valid(&'a'));
		assert!(is_char_valid(&'1'));
		assert!(is_char_valid(&'-'));
		assert!(is_char_valid(&'{'));
		assert!(!is_char_valid(&' '));
	}
}
