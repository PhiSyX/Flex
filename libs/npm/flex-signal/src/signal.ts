// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { isDOMInput } from "@phisyx/flex-asserts";
import { Computed, type ComputedWatchFnOptions } from "./computed";

// --------- //
// Interface //
// --------- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

type SignalOptions<T> = {
	watch?: (newValue: T, oldValue: T) => void;
	parser?: (_: unknown) => T;
};

type WatchCallback<R = FIXME, T = FIXME> = (oldValue: T, newValue: T) => R;

// -------------- //
// Implémentation //
// -------------- //

export class Signal<T = FIXME> {
	#triggerElements: Array<HTMLElement | Node | Text> = [];
	#watchCallbacks: Array<WatchCallback<FIXME, T>> = [];

	#value!: T;
	#options: SignalOptions<T> = {
		parser: (v: unknown) => v as T,
	};

	constructor(value: T, options?: SignalOptions<T>) {
		this.#value = value;
		this.#options = options || this.#options;
	}

	addCallback(cb: WatchCallback<FIXME, T>) {
		this.#watchCallbacks.push(cb);
	}

	addTriggerElement(el: HTMLElement | Node | Text) {
		this.#triggerElements.push(el);
	}

	removeLastTriggerElement() {
		this.#triggerElements.pop();
	}

	lastTriggerElement(): HTMLElement | Node | Text {
		return this.#triggerElements[this.#triggerElements.length - 1];
	}

	computed<R>(fn: (_: T) => R): Computed<R> {
		return new Computed(this, fn);
	}

	replace(newValue: T | ((value: T) => T)) {
		const isFn = (value: unknown): value is (value: T) => T => {
			return typeof value === "function";
		};

		if (isFn(newValue)) {
			this.set(newValue(this.valueOf()));
		} else {
			this.set(this.#options.parser?.(newValue) ?? newValue);
		}
	}

	set(newValue: T) {
		const oldValue = this.#value;
		this.#value = newValue;
		this.#notify(oldValue, this.#value);
	}

	#notify(oldValue: T, newValue: T) {
		if (oldValue === newValue) return;

		this.#options.watch?.(newValue, oldValue);

		this.updateElements();

		for (const watchFn of this.#watchCallbacks) {
			watchFn(oldValue, newValue);
		}
	}

	updateElements() {
		for (const $trigger of this.#triggerElements) {
			if ($trigger instanceof Text) {
				$trigger.textContent = this.toString();
			} else if (isDOMInput($trigger)) {
				$trigger.value = this.toString();
			} else {
				$trigger.textContent = this.toString();
			}
		}
	}

	valueOf(): T {
		return this.#options.parser?.(this.#value) ?? this.#value;
	}

	toString(): string {
		return (this.valueOf() as { toString(): string }).toString();
	}

	watch<R>(fn: (_: this) => R, options?: ComputedWatchFnOptions) {
		let computed = new Computed(this, () => this);
		computed.watch(fn, options);
	}
}

// -------- //
// Fonction //
// -------- //

export function signal<T>(data: T, options?: SignalOptions<T>): Signal<T> {
	return new Signal(data, options);
}

export function isSignal<T>(value: unknown): value is Signal<T> {
	return value instanceof Signal;
}
