// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { minmax } from "#src/minmax";
import { expect, it } from "vitest";

it("minmax: <= x", () => {
	expect(minmax(0, 0, 7)).toEqual(0);

	expect(minmax(-2, -4, 7)).toEqual(-2);
	expect(minmax(2, -1, 7)).toEqual(2);
	expect(minmax(4, -42, 7)).toEqual(4);
});

it("minmax: entre x et y", () => {
	expect(minmax(0, 7, 12)).toEqual(7);
	expect(minmax(0, 42, 91)).toEqual(42);
});

it("minmax: >= x", () => {
	expect(minmax(0, 12, 12)).toEqual(12);

	expect(minmax(0, 24, 12)).toEqual(12);
	expect(minmax(0, 1000, 91)).toEqual(91);
});

it("minmax: ===", () => {
	expect(minmax(0, 0, 0)).toEqual(0);
	expect(minmax(91, 91, 91)).toEqual(91);
});
