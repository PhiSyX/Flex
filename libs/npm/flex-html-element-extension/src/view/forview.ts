// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Signal } from "@phisyx/flex-signal";

import { is_array } from "@phisyx/flex-asserts";
import { is_signal } from "@phisyx/flex-signal";

import { HTMLElementExtension as HExt, } from "../extension";

// TODO: use Computed
export function forview<T>(
	arr: Signal<Array<T>> | Array<T>,
	shallow_view: (key: T) => HExt | Promise<HExt>,
): HExt
{
	let fragment = HExt.create_fragment() as HExt;

	if (is_array<T>(arr)) {
		for (let item of arr.map(shallow_view)) {
			fragment.append(item);
		}
	}

	if (is_signal<Array<T>>(arr)) {
		for (let item of arr.valueOf().map(shallow_view)) {
			fragment.append(item);
		}
	}

	return fragment;
}
