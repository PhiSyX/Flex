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

import { kebabcase } from "../index";

it("kebab-case: vide", () => {
	expect(kebabcase("")).toEqual("");
});

it("kebab-case: cas basiques", () => {
	expect(kebabcase("h")).toEqual("h");
	expect(kebabcase("HelloWorld")).toEqual("hello-world");
	expect(kebabcase("HelloWorLd")).toEqual("hello-wor-ld");
	expect(kebabcase("hello-world")).toEqual("hello-world");
	expect(kebabcase("hello-World")).toEqual("hello-world");
	expect(kebabcase("hello--World")).toEqual("hello-world");
});

it("kebab-case: plusieurs majuscules à la suite", () => {
	expect(kebabcase("HELLOWORLD")).toEqual("h-e-l-l-o-w-o-r-l-d");
});

it("kebab-case: inclus le tiret avant un nombre", () => {
	expect(
		kebabcase("Hello1World", {
			includes_dash_before_number: false,
		})
	).toEqual("hello1-world");

	expect(
		kebabcase("Hello1World", {
			includes_dash_before_number: true,
		})
	).toEqual("hello-1-world");
});

it("kebab-case: inclus les caractères spéciaux trouvés après le tiret", () => {
	expect(kebabcase("Hello@World")).toEqual("hello-world");

	expect(
		kebabcase("Hello@World", {
			includes_special_chars_after_dash: true,
		})
	).toEqual("hello-@-world");
});

it("kebab-case: réduire les tirets cumulés en un seul tiret", () => {
	expect(
		kebabcase("Hello@World", {
			reduce_cumulative_hyphens_into_one: true,
		})
	).toEqual("hello-world");

	expect(
		kebabcase("Hello@World", {
			reduce_cumulative_hyphens_into_one: false,
		})
	).toEqual("hello--world");
});
