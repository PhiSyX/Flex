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

import { None, Option, Some } from "../index";

it("Option: Some", () => {
	expect(Some("")).toEqual(Some(""));
	expect(Some(null)).toEqual(None());
	expect(Some(undefined)).toEqual(None());
});

it("Option: None", () => {
	expect(None()).toEqual(None());
});

it("Option: from", () => {
	expect(Option.from(null)).toEqual(None());

	expect(Option.from("hello")).toEqual(Some("hello"));
});

it("Option: {is_some, is_none}", () => {
	expect(Some("").is_some()).toBeTruthy();
	expect(Some("").is_none()).toBeFalsy();

	expect(None().is_some()).toBeFalsy();
	expect(None().is_none()).toBeTruthy();
});

it("Option: and_then", () => {
	expect(Some("hello").and_then((str) => Some(str.length))).toEqual(Some(5));
});

it("Option: filter", () => {
	expect(Some("hello").filter((str) => str.length === 5)).toEqual(
		Some("hello"),
	);

	expect(Some("hello").filter((str) => str.length < 5)).toEqual(None());

	expect(
		None<string>()
			.filter((c) => c.startsWith("#"))
			.is_none(),
	).toBeTruthy();
});

it("Option: filter_map", () => {
	expect(
		Some(42).filter_map((n) => {
			if (n >= 18) return Some(n * 2);
			return None();
		}),
	).toEqual(Some(84));

	expect(
		Some(42).filter_map((n) => {
			if (n <= 18) return Some(n * 2);
			return None();
		}),
	).toEqual(None());

	// NOTE: Le type `Option<number>` est requis ici.
	const maybe_n: Option<number> = None();
	expect(
		maybe_n.filter_map((n) => {
			if (n <= 18) return Some(n * 2);
			return None();
		}),
	).toEqual(None());
});

it("Option: map", () => {
	expect(Some("Hello").map((hello) => `${hello} World`)).toEqual(
		Some("Hello World"),
	);

	expect(None().map((hello) => `${hello} World`)).toEqual(None());
});

it("Option: {or, or_else}", () => {
	expect(Some("Hello").or(Some("Hello World"))).toEqual(Some("Hello"));

	expect(Some("Hello").or_else(() => Some("Hello World"))).toEqual(
		Some("Hello"),
	);

	// NOTE: Le type `Option<string>` est requis ici.
	const maybe_str: Option<string> = None();
	expect(maybe_str.or_else(() => Some("Hello World"))).toEqual(
		Some("Hello World"),
	);
});

it("Option: unwrap", () => {
	expect(Some("hello").unwrap()).toBe("hello");
	expect(() => None().unwrap()).toThrowError(
		"La fonction `.unwrap()` est appelée sur une valeur `None`.",
	);
});

it("Option: {unwrap_or, unwrap_or_else}", () => {
	expect(Some("hello").unwrap_or("world")).toBe("hello");
	expect(None().unwrap_or("world")).toBe("world");

	expect(Some("hello").unwrap_or_else(() => "world")).toBe("hello");
	expect(None().unwrap_or_else(() => "world")).toBe("world");
});

it("Option: replace", () => {
	expect(Some("hello").replace("world")).toEqual(Some("world"));

	// NOTE: Le type `Option<string>` est requis ici.
	const maybe_str: Option<string> = None();
	expect(maybe_str.replace("world")).toEqual(Some("world"));
});

it("Option: replace null value", () => {
	const value = JSON.parse("null");
	// NOTE: Le type `Option<string>` est requis ici.
	const maybe_str: Option<string> = None();
	expect(maybe_str.replace(value)).toEqual(None());
});

it("Option: zip", () => {
	expect(Some("hello").zip(Some("world"))).toEqual(Some(["hello", "world"]));

	expect(Some("hello").zip(None())).toEqual(None());
});
