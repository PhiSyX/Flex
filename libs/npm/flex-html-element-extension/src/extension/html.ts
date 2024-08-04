// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";
import { type Computed, type Signal, is_computed } from "@phisyx/flex-signal";
import { ElementExtension } from "./_ext";

// --------- //
// Interface //
// --------- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

namespace HTMLElementExtension {
	export type Arg =
		| Primitives
		| Fn
		| Sig
		| Com
		| HTMLElement
		| HTMLElementExtension
		| Node
		| Option<Arg>
		| Promise<Arg>;

	export type Args = Array<Arg>;
	export type Primitives = string | number | boolean | bigint;
	export type Fn = () => HTMLElementExtension | HTMLElement;
	export type Sig = Signal;
	export type Com = Computed;
	export type Self = HTMLElementExtension;

	export type NodeExtension = Node & { extension?: HTMLElementExtension };

	type TargetedEvent<
		Target extends EventTarget = EventTarget,
		TypedEvent extends Event = Event,
	> = Omit<TypedEvent, "currentTarget" | "target"> & {
		readonly currentTarget: Target;
		readonly target: Target;
	};

	// EXAMPLE: T as "click" => `(evt: MouseEvent): void`
	// EXAMPLE: T as "custom" => `(evt: CustomEvent): void`
	export type ChooseGoodEvent<
		T extends EventTarget,
		K,
	> = K extends keyof HTMLElementEventMap
		? (this: Self, evt: TargetedEvent<T, HTMLElementEventMap[K]>) => void
		: (this: Self, evt: CustomEvent) => void;
}

type InputTypeHTMLAttribute =
	| "button"
	| "checkbox"
	| "color"
	| "date"
	| "datetime-local"
	| "email"
	| "file"
	| "hidden"
	| "image"
	| "month"
	| "number"
	| "password"
	| "radio"
	| "range"
	| "reset"
	| "search"
	| "submit"
	| "tel"
	| "text"
	| "time"
	| "url"
	| "week"
	| (string & {});

// -------------- //
// Implémentation //
// -------------- //

class HTMLElementExtension<E extends HTMLElement = FIXME> extends ElementExtension<E>
{
	public static create_element<
		T extends keyof HTMLElementTagNameMap,
		NE extends HTMLElementTagNameMap[T],
	>(
		tag_name: T,
		args: Array<HTMLElementExtension.Arg>,
	): HTMLElementExtension<NE>
	{
		let $native_element = document.createElement(tag_name) as NE;
		return new HTMLElementExtension($native_element, args);
	}

	/**
	 * Public API
	 */

	on<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: HTMLElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	on<K>(
		type: K,
		listener: HTMLElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	on(
		type: FIXME,
		listener: HTMLElementExtension.ChooseGoodEvent<E, FIXME>,
		options?: boolean | AddEventListenerOptions,
	): this
	{
		this.native_element.addEventListener(type, listener.bind(this), options);
		return this;
	}

	off<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: HTMLElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	off<K>(
		type: K,
		listener: HTMLElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	off(
		type: FIXME,
		listener: HTMLElementExtension.ChooseGoodEvent<E, FIXME>,
		options?: boolean | AddEventListenerOptions,
	): this
	{
		this.native_element.removeEventListener(
			type,
			listener.bind(this),
			options,
		);
		return this;
	}

	on_click(fn: (evt: MouseEvent) => void): this
	{
		return this.on("click", fn);
	}

	on_keydown(fn: (evt: KeyboardEvent) => void): this
	{
		return this.on_keydown(fn);
	}

	on_keydown_code(
		code: Computed<KeyboardEvent["code"]> | KeyboardEvent["code"],
		fn: (evt: KeyboardEvent) => void,
	): this
	{
		const hndlr = (code: KeyboardEvent["code"]) => (evt: KeyboardEvent) => {
			if (evt.code.toLowerCase() === code.toLowerCase()) fn(evt);
		};

		if (is_computed(code)) {
			code.watch(
				(new_value, old_value) => {
					this.off("keydown", hndlr(old_value || new_value));
					this.on("keydown", hndlr(new_value));
				},
				{ immediate: true },
			);
			return this;
		}

		return this.on("keydown", hndlr(code));
	}

	on_keydown_enter(fn: (evt: KeyboardEvent) => void): this
	{
		return this.on_keydown_code("enter", fn);
	}

	on_keydown_escape(fn: (evt: KeyboardEvent) => void): this
	{
		return this.on_keydown_code("escape", fn);
	}

	type(ty?: InputTypeHTMLAttribute): this
	{
		this.set_attribute("type", ty);
		return this;
	}
}

// ------ //
// Export //
// ------ //

export { HTMLElementExtension };
