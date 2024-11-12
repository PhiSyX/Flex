// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// -------- //
// Fonction //
// -------- //

function is_bigint(value: unknown): value is bigint {
	return typeof value === "bigint";
}

function is_boolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

function is_number(value: unknown): value is number {
	return typeof value === "number";
}

function is_string(value: unknown): value is string {
	return typeof value === "string";
}

function is_primitive<K = boolean>(value: K): value is K {
	return (
		is_bigint(value) ||
		is_boolean(value) ||
		is_number(value) ||
		is_string(value)
	);
}

// ------ //
// Export //
// ------ //

export { is_bigint, is_boolean, is_number, is_string, is_primitive };
