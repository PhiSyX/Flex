// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import { None, Some } from "@phisyx/flex-safety";

// ------ //
// Static //
// ------ //

/*static*/
const STATIC_CACHE = new Map();

// -------- //
// Fonction //
// -------- //

function memcache<Key, Value>(key: Key, value_fn: () => Value): Value
{
	if (!STATIC_CACHE.has(key)) {
		STATIC_CACHE.set(key, value_fn());
	}
	// biome-ignore lint/style/noNonNullAssertion: Voir le code ci-haut.
	return STATIC_CACHE.get(key)!;
}

// ---- //
// Type //
// ---- //

interface FuzzySearchRecord
{
	type: FuzzySearchType;
	word: string;
};

// ----------- //
// Énumération //
// ----------- //

enum FuzzySearchType
{
	Hit = "HIT",
	Text = "TEXT",
}

// -------- //
// Fonction //
// -------- //

const push_to_result = (
	arr: Array<FuzzySearchRecord>,
	word: FuzzySearchRecord["word"],
) => {
	return (type: FuzzySearchRecord["type"]) => {
		if (word.length === 0) {
			return arr;
		}
		const maybe_last = arr[arr.length - 1];
		if (maybe_last == null) {
			return [...arr, { type, word }];
		}

		const last = maybe_last;
		if (last.type === type) {
			return [...arr.slice(0, -1), { type, word: last.word + word }];
		}
		return [...arr, { type, word }];
	};
};

function fuzzy_search(
	needle: string,
	haystack: string,
): Option<Array<FuzzySearchRecord>>
{
	return memcache(haystack + needle, () => {
		const search_size = needle.length;
		const in_str_len = haystack.length;

		let pattern_idx = 0;
		let str_idx = 0;

		let matches: Array<FuzzySearchRecord> = [];

		while (pattern_idx !== search_size && str_idx !== in_str_len) {
			const pattern_ch = needle.charAt(pattern_idx);
			const str_ch = haystack.charAt(str_idx);
			const push = push_to_result(matches, str_ch);
			if (
				pattern_ch === str_ch ||
				pattern_ch.toLowerCase() === str_ch.toLowerCase()
			) {
				++pattern_idx;
				matches = push(FuzzySearchType.Hit);
			} else {
				matches = push(FuzzySearchType.Text);
			}
			++str_idx;
		}

		matches = push_to_result(
			matches,
			haystack.slice(str_idx),
		)(FuzzySearchType.Text);

		return search_size !== 0 &&
			in_str_len !== 0 &&
			pattern_idx === search_size
				? Some(matches)
				: None();
	});
}

// ------ //
// Export //
// ------ //

export type { FuzzySearchRecord };

export { fuzzy_search, FuzzySearchType };
