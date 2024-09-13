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
	/**
	 * Inclus le caractère '_' avant un nombre
	 *
	 * @default false
	 */
	includes_underscore_before_number?: boolean;
	/**
	 * Inclus les caractères spéciaux après le caractère '_'
	 *
	 * @default false
	 */
	includes_special_chars_after_underscore?: boolean;
	/**
	 * Réduire tous les caractères '_' en un seul caractère '_'
	 *
	 * @default true
	 */
	reduce_cumulative_underscores_into_one?: boolean;
};

// -------- //
// Constant //
// -------- //

const Default: Options = {
	includes_underscore_before_number: false,
	includes_special_chars_after_underscore: false,
	reduce_cumulative_underscores_into_one: true,
};

// -------- //
// Fonction //
// -------- //

/// Transforme une chaîne de caractère en snakecase.
function snakecase(text: string, user_options: Options = Default): string {
	let options: Options = { ...Default, ...user_options };

	let algo = (ch: string[number] /* char */, idx: number) => {
		if (ch === "_") {
			return ch;
		}

		if (ch === ch.toUpperCase()) {
			let prefix = idx !== 0 ? "_" : "";

			if (options.includes_underscore_before_number) {
				if (/\d/.test(ch)) {
					return `${prefix}${ch.toLowerCase()}`;
				}
			}

			if (options.includes_special_chars_after_underscore) {
				if (!/[a-z]/i.test(ch)) {
					return `${prefix}${ch.toLowerCase()}`;
				}
			}

			if (/[a-z]/i.test(ch)) {
				return `${prefix}${ch.toLowerCase()}`;
			}

			if (/\d/.test(ch)) {
				return ch;
			}

			return prefix;
		}

		return ch;
	};

	let output = text.split("").map(algo).join("");
	if (options.reduce_cumulative_underscores_into_one) {
		return output.replace(/_{2,}/g, "_");
	}
	return output;
}

// ------ //
// Export //
// ------ //

export { snakecase };
