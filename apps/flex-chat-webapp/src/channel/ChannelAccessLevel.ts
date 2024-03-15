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
	level: ChannelAccessLevelFlag;
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

export enum ChannelAccessLevelFlag {
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

const CHANNEL_ACCESS_LEVEL_SYMBOLS = {
	[ChannelAccessLevelFlag.Owner]: ChannelAccessLevelSymbol.Owner,
	[ChannelAccessLevelFlag.AdminOperator]: ChannelAccessLevelSymbol.AdminOperator,
	[ChannelAccessLevelFlag.Operator]: ChannelAccessLevelSymbol.Operator,
	[ChannelAccessLevelFlag.HalfOperator]: ChannelAccessLevelSymbol.HalfOperator,
	[ChannelAccessLevelFlag.Vip]: ChannelAccessLevelSymbol.Vip,
	[ChannelAccessLevelFlag.User]: ChannelAccessLevelSymbol.User,
} as const;

//  const CHANNEL_ACCESS_LEVEL_SYMBOLS_FLAGS = {
// 	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevelFlag.Owner,
// 	[ChannelAccessLevelSymbol.AdminOperator]: ChannelAccessLevelFlag.AdminOperator,
// 	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevelFlag.Operator,
// 	[ChannelAccessLevelSymbol.HalfOperator]: ChannelAccessLevelFlag.HalfOperator,
// 	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevelFlag.Vip,
// 	[ChannelAccessLevelSymbol.User]: ChannelAccessLevelFlag.User,
// } as const;

const CHANNEL_ACCESS_LEVEL_SYMBOLS_LETTERS = {
	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevelLetter.Owner,
	[ChannelAccessLevelSymbol.AdminOperator]: ChannelAccessLevelLetter.AdminOperator,
	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevelLetter.Operator,
	[ChannelAccessLevelSymbol.HalfOperator]: ChannelAccessLevelLetter.HalfOperator,
	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevelLetter.Vip,
	[ChannelAccessLevelSymbol.User]: ChannelAccessLevelLetter.User,
} as const;

const CHANNEL_ACCESS_LEVEL_SYMBOLS_CLASSNAMES = {
	[ChannelAccessLevelSymbol.Owner]: ChannelAccessLevelClassName.Owner,
	[ChannelAccessLevelSymbol.AdminOperator]: ChannelAccessLevelClassName.AdminOperator,
	[ChannelAccessLevelSymbol.Operator]: ChannelAccessLevelClassName.Operator,
	[ChannelAccessLevelSymbol.HalfOperator]: ChannelAccessLevelClassName.HalfOperator,
	[ChannelAccessLevelSymbol.Vip]: ChannelAccessLevelClassName.Vip,
	[ChannelAccessLevelSymbol.User]: ChannelAccessLevelClassName.User,
} as const;
const CHANNEL_ACCESS_LEVEL_GROUPS = {
	[ChannelAccessLevelFlag.Owner]: "owners",
	[ChannelAccessLevelFlag.AdminOperator]: "adminOperators",
	[ChannelAccessLevelFlag.Operator]: "operators",
	[ChannelAccessLevelFlag.HalfOperator]: "halfOperators",
	[ChannelAccessLevelFlag.Vip]: "vips",
	[ChannelAccessLevelFlag.User]: "users",
} as const;

// -------------- //
// Implémentation //
// -------------- //

export class ChannelAccessLevel {
	// --------- //
	// Propriété //
	// --------- //

	private _highest!: HighestAccessLevelOutput;

	modes: Set<ChannelAccessLevelFlag> = new Set();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Niveau d'accès du pseudo le plus haut gradé.
	 */
	get highest() {
		if (!this._highest) {
			this._highest = this.highestAccessLevel();
		}
		return this._highest;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Ajoute un niveau d'accès aux modes d'accès.
	 */
	add(level: ChannelAccessLevelFlag) {
		this.modes.add(level);
	}

	/**
	 * Est-ce que le membre a dans ses niveaux d'accès, un niveau d'accès
	 * donné.
	 */
	eq(level: ChannelAccessLevelFlag): boolean {
		return this.highest.level === level;
	}

	/**
	 * Est-ce que le membre a dans ses niveaux d'accès, un niveau d'accès
	 * minimal donné.
	 */
	ge(level: ChannelAccessLevelFlag): boolean {
		return this.highest.level >= level;
	}

	/**
	 * Est-ce que le membre a dans ses niveaux d'accès, un niveau d'accès
	 * minimal donné.
	 */
	gt(level: ChannelAccessLevelFlag): boolean {
		return this.highest.level > level;
	}

	/**
	 * Récupère le mode le plus haut gradé d'un pseudo.
	 */
	highestAccessLevel(): HighestAccessLevelOutput {
		if (this.modes.size === 0) {
			return {
				className: ChannelAccessLevelClassName.User,
				letter: ChannelAccessLevelLetter.User,
				level: ChannelAccessLevelFlag.User,
				symbol: ChannelAccessLevelSymbol.User,
				group: "users",
			};
		}

		const level = Array.from(this.modes).reduce((acc, mode) => {
			if (mode > acc) return mode;
			return acc;
		}, ChannelAccessLevelFlag.User);

		const symbol = CHANNEL_ACCESS_LEVEL_SYMBOLS[level];
		const letter = CHANNEL_ACCESS_LEVEL_SYMBOLS_LETTERS[symbol];
		const className = CHANNEL_ACCESS_LEVEL_SYMBOLS_CLASSNAMES[symbol];
		const group = CHANNEL_ACCESS_LEVEL_GROUPS[level];

		return { letter, symbol, className, level, group };
	}

	/**
	 * Analyse les niveaux d'access d'un pseudo.
	 */
	parse(levels: Array<string>): Array<ChannelAccessLevelFlag> {
		return levels.map(this.parseOne);
	}

	/**
	 * Analyse un niveau d'accès.
	 */
	parseOne(level: string): ChannelAccessLevelFlag {
		switch (level.toLowerCase()) {
			case "~":
			case "q":
			case "owner":
				return ChannelAccessLevelFlag.Owner;
			case "&":
			case "a":
			case "admin_operator":
				return ChannelAccessLevelFlag.AdminOperator;
			case "@":
			case "o":
			case "operator":
				return ChannelAccessLevelFlag.Operator;
			case "%":
			case "h":
			case "half_operator":
				return ChannelAccessLevelFlag.HalfOperator;
			case "+":
			case "v":
			case "vip":
				return ChannelAccessLevelFlag.Vip;
			default:
				return ChannelAccessLevelFlag.User;
		}
	}
}
