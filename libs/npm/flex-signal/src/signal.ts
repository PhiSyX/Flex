// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ComputedWatchFnOptions } from "./computed";

import { is_dom_input, is_function } from "@phisyx/flex-asserts";

import { Computed } from "./computed";

// --------- //
// Interface //
// --------- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

interface SignalOptions<T>
{
	watch?: (new_value: T, old_value: T) => void;
	parser?: (_: unknown) => T;
};

type WatchCallback<R = FIXME, T = FIXME> = (old_value: T, new_value: T) => R;

// -------------- //
// Implémentation //
// -------------- //

export class Signal<T = FIXME>
{
	#trigger_elements: Array<HTMLElement | Node | Text> = [];
	#watch_callbacks: Array<WatchCallback<FIXME, T>> = [];

	#value!: T;
	#options: SignalOptions<T> = {
		parser: (v: unknown) => v as T,
	};

	constructor(value: T, options?: SignalOptions<T>)
	{
		this.#value = value;
		this.#options = options || this.#options;
	}

	add_callback(cb: WatchCallback<FIXME, T>)
	{
		this.#watch_callbacks.push(cb);
	}

	add_trigger_element(el: HTMLElement | Node | Text)
	{
		this.#trigger_elements.push(el);
	}

	remove_last_triggered_element()
	{
		this.#trigger_elements.pop();
	}

	last_triggered_element(): HTMLElement | Node | Text
	{
		return this.#trigger_elements[this.#trigger_elements.length - 1];
	}

	computed<R>(fn: (_: T) => R): Computed<R>
	{
		return new Computed(this, fn);
	}

	replace(new_value: T | ((value: T) => T))
	{
		if (is_function<T, T>(new_value)) {
			this.set(new_value(this.valueOf()));
		} else {
			this.set(this.#options.parser?.(new_value) ?? new_value);
		}
	}

	set(new_value: T)
	{
		let old_value = this.#value;
		this.#value = new_value;
		this.#notify(old_value, this.#value);
	}

	#notify(old_value: T, new_value: T)
	{
		if (old_value === new_value) {
			return;
		}

		this.#options.watch?.(new_value, old_value);

		this.update_elements();

		for (let watch_fn of this.#watch_callbacks) {
			watch_fn(old_value, new_value);
		}
	}

	update_elements()
	{
		for (let $trigger of this.#trigger_elements) {
			if ($trigger instanceof Text) {
				$trigger.textContent = this.toString();
			} else if (is_dom_input($trigger)) {
				$trigger.value = this.toString();
			} else {
				$trigger.textContent = this.toString();
			}
		}
	}

	valueOf(): T
	{
		return this.#options.parser?.(this.#value) ?? this.#value;
	}

	toString(): string
	{
		return (this.valueOf() as { toString(): string }).toString();
	}

	watch<R>(fn: (_: this) => R, options?: ComputedWatchFnOptions)
	{
		let computed = new Computed(this, () => this);
		computed.watch(fn, options);
	}
}

// -------- //
// Fonction //
// -------- //

export function signal<T>(data: T, options?: SignalOptions<T>): Signal<T>
{
	return new Signal(data, options);
}

export function is_signal<T>(value: unknown): value is Signal<T>
{
	return value instanceof Signal;
}
