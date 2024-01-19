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

import { camelCase } from "../index";

it("camelCase: vide", () => {
	expect(camelCase("")).toEqual("");
});

it("camelCase: cas basiques", () => {
	expect(camelCase(" ")).toEqual(" ");
	expect(camelCase("h")).toEqual("H");
	expect(camelCase("hello world")).toEqual("Hello World");
	expect(camelCase("HELLO WORLD")).toEqual("Hello World");
});

it("camelCase: espace en trop", () => {
	expect(camelCase("hello ")).toEqual("Hello ");

	expect(camelCase("hello    ")).toEqual("Hello    ");
	expect(camelCase("    hello    ")).toEqual("    Hello    ");
});

it("camelCase: garde le reste de la chaîne de caractères intacte", () => {
	expect(camelCase("HeLLo WorLd", { to_lower: false })).toEqual(
		"HeLLo WorLd"
	);
});

it("camelCase: exclusion des séparateurs dans le résultat", () => {
	expect(camelCase("hello ", { includes_separators: false })).toEqual(
		"Hello"
	);

	expect(
		camelCase("hello world", {
			includes_separators: false,
		})
	).toEqual("HelloWorld");

	expect(
		camelCase("    hello    ", {
			includes_separators: false,
		})
	).toEqual("Hello");
});
