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

// ---- //
// Type //
// ---- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

type ComputedWatchCallback<R = FIXME, T = FIXME> = (_: T) => R;

export interface ComputedWatchFnOptions
{
	immediate?: boolean;
};

// -------------- //
// Implémentation //
// -------------- //

export class Computed<R = FIXME> 
{
	#return_fn: ComputedWatchCallback<R>;

	constructor(
		public signal: Signal,
		return_fn: ComputedWatchCallback<R>,
	)
	{
		this.#return_fn = return_fn;
	}

	valueOf(): R
	{
		return this.#return_fn(this.signal.valueOf());
	}

	watch(
		callback: (value: FIXME, old_value: FIXME) => void,
		options?: ComputedWatchFnOptions,
	)
	{
		this.signal.add_callback((old_value, new_value) => {
			if (old_value !== new_value) {
				callback(this.#return_fn(new_value), old_value);
			}
		});

		if (options?.immediate) {
			callback(this.valueOf(), null);
		}
	}
}

// -------- //
// Fonction //
// -------- //

export function is_computed(value: unknown): value is Computed 
{
	return value instanceof Computed;
}
