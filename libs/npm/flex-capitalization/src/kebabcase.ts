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
	 * Inclus le caractère '-' avant un nombre
	 *
	 * @default false
	 */
	includes_dash_before_number?: boolean;
	/**
	 * Inclus les caractères spéciaux trouvés après le caractère '-'.
	 *
	 * @default false
	 */
	includes_special_chars_after_dash?: boolean;
	/**
	 * Réduire tous les caractères tirets cumulés en un seul tiret.
	 *
	 * @default true
	 */
	reduce_cumulative_hyphens_into_one?: boolean;
};

// -------- //
// Constant //
// -------- //

const Default: Options = {
	includes_dash_before_number: false,
	includes_special_chars_after_dash: false,
	reduce_cumulative_hyphens_into_one: true,
};

// -------- //
// Fonction //
// -------- //

/// Transforme une chaîne de caractère en kebab-case.
function kebabcase(text: string, user_options: Options = Default): string
{
	let options: Options = { ...Default, ...user_options };

	let algo = (ch: string[number] /* char */, idx: number) => {
		if (ch === "-" || ch !== ch.toUpperCase()) {
			return ch;
		}

		let prefix = idx !== 0 ? "-" : "";

		if (options.includes_dash_before_number) {
			if (/\d/.test(ch)) {
				return `${prefix}${ch.toLowerCase()}`;
			}
		}

		if (options.includes_special_chars_after_dash) {
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
	};

	let output = text.split("").map(algo).join("");

	if (options.reduce_cumulative_hyphens_into_one) {
		return output.replace(/-{2,}/g, "-");
	}

	return output;
}

// ------ //
// Export //
// ------ //

export { kebabcase };
