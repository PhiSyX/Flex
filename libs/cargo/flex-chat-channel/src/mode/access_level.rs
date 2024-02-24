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

#[allow(non_camel_case_types)]
type CHANNEL_ACCESS_LEVEL_FLAG = u32;

// -------- //
// Constant //
// -------- //

/// Le drapeau du niveau d'accès des propriétaires de salon.
pub const CHANNEL_ACCESS_LEVEL_OWNER_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 7;
pub const CHANNEL_ACCESS_LEVEL_OWNER_LETTER: char = 'q';
pub const CHANNEL_ACCESS_LEVEL_OWNER_SYMBOL: char = '~';

/// Le drapeau du niveau d'accès des admins de salon.
pub const CHANNEL_ACCESS_LEVEL_ADMIN_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 6;
pub const CHANNEL_ACCESS_LEVEL_ADMIN_LETTER: char = 'a';
pub const CHANNEL_ACCESS_LEVEL_ADMIN_SYMBOL: char = '&';

/// Le drapeau du niveau d'accès des opérateurs de salon.
pub const CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 5;
pub const CHANNEL_ACCESS_LEVEL_OPERATOR_LETTER: char = 'o';
pub const CHANNEL_ACCESS_LEVEL_OPERATOR_SYMBOL: char = '@';

/// Le drapeau du niveau d'accès des (demi) opérateurs de salon.
pub const CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 4;
pub const CHANNEL_ACCESS_LEVEL_HALFOPERATOR_LETTER: char = 'h';
pub const CHANNEL_ACCESS_LEVEL_HALFOPERATOR_SYMBOL: char = '%';

/// Le drapeau du niveau d'accès des VIP's de salon.
pub const CHANNEL_ACCESS_LEVEL_VIP_FLAG: CHANNEL_ACCESS_LEVEL_FLAG = 1 << 3;
pub const CHANNEL_ACCESS_LEVEL_VIP_LETTER: char = 'v';
pub const CHANNEL_ACCESS_LEVEL_VIP_SYMBOL: char = '+';

// ----------- //
// Énumération //
// ----------- //

#[derive(Debug)]
#[derive(Copy, Clone)]
#[derive(serde::Serialize, serde::Deserialize)]
#[derive(PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
#[repr(u32)]
pub enum ChannelAccessLevel
{
	/// Niveau d'accès Propriétaire.
	Owner = CHANNEL_ACCESS_LEVEL_OWNER_FLAG,
	/// Niveau d'accès Opérateur Admin.
	AdminOperator = CHANNEL_ACCESS_LEVEL_ADMIN_FLAG,
	/// Niveau d'accès Opérateur.
	Operator = CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG,
	/// Niveau d'accès Demi Opérateur.
	HalfOperator = CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG,
	/// Niveau d'accès Voice / VIP.
	Vip = CHANNEL_ACCESS_LEVEL_VIP_FLAG,
}

// -------------- //
// Implémentation //
// -------------- //

impl ChannelAccessLevel
{
	/// Lettre lié à un mode de salon pour utilisateur.
	pub fn letter(&self) -> char
	{
		match self {
			| Self::Owner => CHANNEL_ACCESS_LEVEL_OWNER_LETTER,
			| Self::AdminOperator => CHANNEL_ACCESS_LEVEL_ADMIN_LETTER,
			| Self::Operator => CHANNEL_ACCESS_LEVEL_OPERATOR_LETTER,
			| Self::HalfOperator => CHANNEL_ACCESS_LEVEL_HALFOPERATOR_LETTER,
			| Self::Vip => CHANNEL_ACCESS_LEVEL_VIP_LETTER,
		}
	}

	/// Drapeau d'un mode de salon pour un utilisateur.
	pub fn flag(&self) -> CHANNEL_ACCESS_LEVEL_FLAG
	{
		match self {
			| Self::Owner => CHANNEL_ACCESS_LEVEL_OWNER_FLAG,
			| Self::AdminOperator => CHANNEL_ACCESS_LEVEL_ADMIN_FLAG,
			| Self::Operator => CHANNEL_ACCESS_LEVEL_OPERATOR_FLAG,
			| Self::HalfOperator => CHANNEL_ACCESS_LEVEL_HALFOPERATOR_FLAG,
			| Self::Vip => CHANNEL_ACCESS_LEVEL_VIP_FLAG,
		}
	}

	/// Symbole lié à un mode de salon pour utilisateur.
	pub fn symbol(&self) -> char
	{
		match self {
			| Self::Owner => CHANNEL_ACCESS_LEVEL_OWNER_SYMBOL,
			| Self::AdminOperator => CHANNEL_ACCESS_LEVEL_ADMIN_SYMBOL,
			| Self::Operator => CHANNEL_ACCESS_LEVEL_OPERATOR_SYMBOL,
			| Self::HalfOperator => CHANNEL_ACCESS_LEVEL_HALFOPERATOR_SYMBOL,
			| Self::Vip => CHANNEL_ACCESS_LEVEL_VIP_SYMBOL,
		}
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl std::str::FromStr for ChannelAccessLevel
{
	type Err = &'static str;

	fn from_str(s: &str) -> Result<Self, Self::Err>
	{
		Ok(match s {
			| "~" => Self::Owner,
			| "&" => Self::AdminOperator,
			| "@" => Self::Operator,
			| "%" => Self::HalfOperator,
			| "+" => Self::Vip,
			| _ => return Err("Seuls l'un des symboles suivants sont attendus: ~&@%+"),
		})
	}
}
