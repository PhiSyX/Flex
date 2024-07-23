// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { isArray } from "@phisyx/flex-asserts";
import { type Signal, isSignal } from "@phisyx/flex-signal";
import {
	// ElementExtension as Ext,
	HTMLElementExtension as HExt,
} from "../extension";

// TODO: use Computed
export function forview<T>(
	arr: Signal<Array<T>> | Array<T>,
	shallowView: (key: T) => HExt | Promise<HExt>,
): HExt {
	let fragment = HExt.createFragment() as HExt;

	if (isArray<T>(arr)) {
		for (const item of arr.map(shallowView)) {
			fragment.append(item);
		}
	}

	if (isSignal<Array<T>>(arr)) {
		for (const item of arr.valueOf().map(shallowView)) {
			fragment.append(item);
		}
	}

	return fragment;
}
