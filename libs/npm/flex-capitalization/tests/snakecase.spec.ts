// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { expect, it } from "vitest";

import { snakecase } from "#src/snakecase";

it("snakecase: vide", () => {
	expect(snakecase("")).toEqual("");
});

it("snakecase: cas basiques", () => {
	expect(snakecase("h")).toEqual("h");
	expect(snakecase("HelloWorld")).toEqual("hello_world");
	expect(snakecase("HelloWorLd")).toEqual("hello_wor_ld");
	expect(snakecase("hello-world")).toEqual("hello_world");
	expect(snakecase("hello-World")).toEqual("hello_world");
	expect(snakecase("hello--World")).toEqual("hello_world");
});

it("snakecase: plusieurs majuscules à la suite", () => {
	expect(snakecase("HELLOWORLD")).toEqual("h_e_l_l_o_w_o_r_l_d");
});

it("snakecase: inclus le tiret du bas avant un nombre", () => {
	expect(
		snakecase("Hello1World", {
			includes_underscore_before_number: false,
		})
	).toEqual("hello1_world");

	expect(
		snakecase("Hello1World", {
			includes_underscore_before_number: true,
		})
	).toEqual("hello_1_world");
});

it("snakecase: inclus les caractères spéciaux trouvés après le tiret du bas", () => {
	expect(snakecase("Hello@World")).toEqual("hello_world");

	expect(
		snakecase("Hello@World", {
			includes_special_chars_after_underscore: true,
		})
	).toEqual("hello_@_world");
});

it("snakecase: réduire les tirets cumulés en un seul tiret du bas", () => {
	expect(
		snakecase("Hello@World", {
			reduce_cumulative_underscores_into_one: true,
		})
	).toEqual("hello_world");

	expect(
		snakecase("Hello@World", {
			reduce_cumulative_underscores_into_one: false,
		})
	).toEqual("hello__world");
});
