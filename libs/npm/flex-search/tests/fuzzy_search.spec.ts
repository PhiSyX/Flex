// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Some } from "@phisyx/flex-safety/option";
import { FuzzySearchType, fuzzy_search } from "#src/fuzzy_search";

import { expect, it } from "vitest";

it("fuzzy_search: cas basiques", () => {
	expect(fuzzy_search("i", "PhiSyX")).toMatchObject(
		Some([
			{
				type: FuzzySearchType.Text,
				word: "Ph",
			},
			{
				type: FuzzySearchType.Hit,
				word: "i",
			},
			{
				type: FuzzySearchType.Text,
				word: "SyX",
			},
		]),
	);

	expect(fuzzy_search("ix", "PhiSyX")).toMatchObject(
		Some([
			{
				type: FuzzySearchType.Text,
				word: "Ph",
			},
			{
				type: FuzzySearchType.Hit,
				word: "i",
			},
			{
				type: FuzzySearchType.Text,
				word: "Sy",
			},
			{
				type: FuzzySearchType.Hit,
				word: "X",
			},
		]),
	);
});

it("fuzzy_search: vide", () => {
	expect(fuzzy_search("", "")).toMatchObject(None());
	expect(fuzzy_search("azertyuiop", "PhiSyX")).toMatchObject(None());
});
