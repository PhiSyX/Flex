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

type Options = {
	/// Remplace tout le reste d'une chaîne de caractères en minuscule.
	to_lower?: boolean;
	/// Inclure les séparateurs dans le résultat?
	includes_separators?: boolean;
};

// -------- //
// Constant //
// -------- //

const INCLUDE_SEPARATOR: RegExp = /([\s-_:]+)/;
const EXCLUDE_SEPARATOR: RegExp = /[\s-_:]+/;

const Default: Options = {
	to_lower: true,
	includes_separators: true,
};

// -------- //
// Fonction //
// -------- //

/// Transforme une chaîne de caractère en une chaîne capitalisée.
function camelCase<T extends string>(text: T, user_options: Options = Default): Capitalize<T> {
	const options: Options = { ...Default, ...user_options };

	const algo = (word: string) => {
		if (word.length === 0) {
			return word;
		}

		// SAFETY: la condition ci-haut nous garantie que la chaîne de
		// caractères comporte au moins 1 caractère, qui nous permet d'accéder à
		// l'index 0 de la chaîne en toute sécurité.
		const first_ch: string[number] /* char */ = word[0].toUpperCase();

		// NOTE(phisyx): le résultat d'une [String.prototype.slice(1)] lorsque
		// la chaîne est vide, renvoie une chaîne vide.
		const rest_of_str: string = word.slice(1);

		if (options.to_lower) {
			return first_ch + rest_of_str.toLowerCase();
		}
		return first_ch + rest_of_str;
	};

	if (!INCLUDE_SEPARATOR.test(text)) {
		return algo(text) as Capitalize<T>;
	}

	if (options.includes_separators === true) {
		return text.split(INCLUDE_SEPARATOR).map(algo).join("") as Capitalize<T>;
	}

	return text.split(EXCLUDE_SEPARATOR).map(algo).join("") as Capitalize<T>;
}

// ------ //
// Export //
// ------ //

export { camelCase };
