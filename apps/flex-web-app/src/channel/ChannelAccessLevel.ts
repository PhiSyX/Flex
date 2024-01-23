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

export type HighestAccessLevelOutput = {
	className: ChannelAccessLevelClassName;
	letter: ChannelAccessLevelLetter;
	level: ChannelAccessLevel;
	symbol: ChannelAccessLevelSymbol;
	group: ChannelAccessLevelGroup;
};

export type ChannelAccessLevelGroup =
	| "owners"
	| "adminOperators"
	| "operators"
	| "halfOperators"
	| "vips"
	| "users";

// ----------- //
// Énumération //
// ----------- //

export enum ChannelAccessLevelLetter {
	Owner = "q",
	AdminOperator = "a",
	Operator = "o",
	HalfOperator = "h",
	Vip = "v",
	User = "",
}

export enum ChannelAccessLevelSymbol {
	Owner = "~",
	AdminOperator = "&",
	Operator = "@",
	HalfOperator = "%",
	Vip = "+",
	User = "",
}

export enum ChannelAccessLevel {
	Owner = 1 << 7,
	AdminOperator = 1 << 6,
	Operator = 1 << 5,
	HalfOperator = 1 << 4,
	Vip = 1 << 3,
	User = 1 << 2,
}

export enum ChannelAccessLevelSort {
	Filtered = 1 << 1,
	Owner = 1 << 7,
	AdminOperator = 1 << 6,
	Operator = 1 << 5,
	HalfOperator = 1 << 4,
	Vip = 1 << 3,
	User = 1 << 2,
}

export enum ChannelAccessLevelClassName {
	Owner = "is-owner",
	AdminOperator = "is-admin-operator",
	Operator = "is-operator",
	HalfOperator = "is-half-operator",
	Vip = "is-vip",
	User = "is-user",
}

// -------- //
// Constant //
// -------- //

export const CHANNEL_ACCESS_LEVEL_SYMBOLS = {
	[ChannelAccessLevel.Owner]: ChannelAccessLevelSymbol.Owner,
	[ChannelAccessLevel.AdminOperator]: ChannelAccessLevelSymbol.AdminOperator,
	[ChannelAccessLevel.Operator]: ChannelAccessLevelSymbol.Operator,
	[ChannelAccessLevel.HalfOperator]: ChannelAccessLevelSymbol.HalfOperator,
	[ChannelAccessLevel.Vip]: ChannelAccessLevelSymbol.Vip,
	[ChannelAccessLevel.User]: ChannelAccessLevelSymbol.User,
};

export const CHANNEL_ACCESS_LEVEL_SYMBOLS_FLAGS = {
	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevel.Owner,
	[ChannelAccessLevelSymbol.AdminOperator]: ChannelAccessLevel.AdminOperator,
	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevel.Operator,
	[ChannelAccessLevelSymbol.HalfOperator]: ChannelAccessLevel.HalfOperator,
	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevel.Vip,
	[ChannelAccessLevelSymbol.User]: ChannelAccessLevel.User,
};

export const CHANNEL_ACCESS_LEVEL_SYMBOLS_LETTERS = {
	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevelLetter.Owner,
	[ChannelAccessLevelSymbol.AdminOperator]:
		ChannelAccessLevelLetter.AdminOperator,
	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevelLetter.Operator,
	[ChannelAccessLevelSymbol.HalfOperator]:
		ChannelAccessLevelLetter.HalfOperator,
	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevelLetter.Vip,
	[ChannelAccessLevelSymbol.User]: ChannelAccessLevelLetter.User,
};

export const CHANNEL_ACCESS_LEVEL_SYMBOLS_CLASSNAMES = {
	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevelClassName.Owner,
	[ChannelAccessLevelSymbol.AdminOperator]:
		ChannelAccessLevelClassName.AdminOperator,
	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevelClassName.Operator,
	[ChannelAccessLevelSymbol.HalfOperator]:
		ChannelAccessLevelClassName.HalfOperator,
	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevelClassName.Vip,
	[ChannelAccessLevelSymbol.User]: ChannelAccessLevelClassName.User,
};
export const CHANNEL_ACCESS_LEVEL_GROUPS = {
	[ChannelAccessLevel.Owner]: "owners",
	[ChannelAccessLevel.AdminOperator]: "adminOperators",
	[ChannelAccessLevel.Operator]: "operators",
	[ChannelAccessLevel.HalfOperator]: "halfOperators",
	[ChannelAccessLevel.Vip]: "vips",
	[ChannelAccessLevel.User]: "users",
} as const;

// -------- //
// Fonction //
// -------- //

/**
 * Récupère le mode le plus haut gradé d'un pseudo.
 */
export function highestAccessLevel(
	modes: Set<ChannelAccessLevel>,
): HighestAccessLevelOutput {
	if (modes.size === 0) {
		return {
			className: ChannelAccessLevelClassName.User,
			letter: ChannelAccessLevelLetter.User,
			level: ChannelAccessLevel.User,
			symbol: ChannelAccessLevelSymbol.User,
			group: "users",
		};
	}

	const level = Array.from(modes).reduce((acc, mode) => {
		if (mode > acc) return mode;
		return acc;
	}, ChannelAccessLevel.User);

	const symbol = CHANNEL_ACCESS_LEVEL_SYMBOLS[level];
	const letter = CHANNEL_ACCESS_LEVEL_SYMBOLS_LETTERS[symbol];
	const className = CHANNEL_ACCESS_LEVEL_SYMBOLS_CLASSNAMES[symbol];
	const group = CHANNEL_ACCESS_LEVEL_GROUPS[level];

	return { letter, symbol, className, level, group };
}

/**
 * Analyse les niveaux d'access d'un pseudo.
 */
export function parseAccessLevels(
	levels: Array<string>,
): Array<ChannelAccessLevel> {
	return levels.map(parseAccessLevel);
}

/**
 * Analyse un niveau d'accès.
 */
export function parseAccessLevel(level: string): ChannelAccessLevel {
	switch (level.toLowerCase()) {
		case "~":
		case "q":
		case "owner":
			return ChannelAccessLevel.Owner;
		case "&":
		case "a":
		case "admin_operator":
			return ChannelAccessLevel.AdminOperator;
		case "@":
		case "o":
		case "operator":
			return ChannelAccessLevel.Operator;
		case "%":
		case "h":
		case "half_operator":
			return ChannelAccessLevel.HalfOperator;
		case "+":
		case "v":
		case "vip":
			return ChannelAccessLevel.Vip;
		default:
			return ChannelAccessLevel.User;
	}
}
