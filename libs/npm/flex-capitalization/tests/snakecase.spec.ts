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

import { snake_case } from "../index";

it("snake_case: vide", () => {
	expect(snake_case("")).toEqual("");
});

it("snake_case: cas basiques", () => {
	expect(snake_case("h")).toEqual("h");
	expect(snake_case("HelloWorld")).toEqual("hello_world");
	expect(snake_case("HelloWorLd")).toEqual("hello_wor_ld");
	expect(snake_case("hello-world")).toEqual("hello_world");
	expect(snake_case("hello-World")).toEqual("hello_world");
	expect(snake_case("hello--World")).toEqual("hello_world");
});

it("snake_case: plusieurs majuscules à la suite", () => {
	expect(snake_case("HELLOWORLD")).toEqual("h_e_l_l_o_w_o_r_l_d");
});

it("snake_case: inclus le tiret du bas avant un nombre", () => {
	expect(
		snake_case("Hello1World", {
			includes_underscore_before_number: false,
		})
	).toEqual("hello1_world");

	expect(
		snake_case("Hello1World", {
			includes_underscore_before_number: true,
		})
	).toEqual("hello_1_world");
});

it("snake_case: inclus les caractères spéciaux trouvés après le tiret du bas", () => {
	expect(snake_case("Hello@World")).toEqual("hello_world");

	expect(
		snake_case("Hello@World", {
			includes_special_chars_after_underscore: true,
		})
	).toEqual("hello_@_world");
});

it("snake_case: réduire les tirets cumulés en un seul tiret du bas", () => {
	expect(
		snake_case("Hello@World", {
			reduce_cumulative_underscores_into_one: true,
		})
	).toEqual("hello_world");

	expect(
		snake_case("Hello@World", {
			reduce_cumulative_underscores_into_one: false,
		})
	).toEqual("hello__world");
});
