// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Signal } from "./signal";

// --------- //
// Interface //
// --------- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

type ComputedWatchCallback<R = FIXME, T = FIXME> = (_: T) => R;

export type ComputedWatchFnOptions = {
	immediate?: boolean;
};

// -------------- //
// Implémentation //
// -------------- //

export class Computed<R = FIXME> {
	#returnFn: ComputedWatchCallback<R>;

	constructor(
		public signal: Signal,
		returnFn: ComputedWatchCallback<R>,
	) {
		this.#returnFn = returnFn;
	}

	valueOf(): R {
		return this.#returnFn(this.signal.valueOf());
	}

	watch(
		callback: (value: FIXME, oldValue: FIXME) => void,
		options?: ComputedWatchFnOptions,
	) {
		this.signal.addCallback((oldValue, newValue) => {
			if (oldValue !== newValue)
				callback(this.#returnFn(newValue), oldValue);
		});
		if (options?.immediate) callback(this.valueOf(), null);
	}
}

// -------- //
// Fonction //
// -------- //

export function isComputed(value: unknown): value is Computed {
	return value instanceof Computed;
}
