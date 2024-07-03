// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Computed, Signal } from "@phisyx/flex-signal";
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
		| Node;

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

class HTMLElementExtension<
	E extends HTMLElement = FIXME,
> extends ElementExtension<E> {
	public static createElement<
		T extends keyof HTMLElementTagNameMap,
		NE extends HTMLElementTagNameMap[T],
	>(
		tagName: T,
		args: Array<HTMLElementExtension.Arg>,
	): HTMLElementExtension<NE> {
		let $nativeElement = document.createElement(tagName) as NE;
		return new HTMLElementExtension($nativeElement, args);
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
	): this {
		this.nativeElement.addEventListener(type, listener.bind(this), options);
		return this;
	}

	onClick(fn: (evt: MouseEvent) => void): this {
		return this.on("click", fn);
	}

	type(ty?: InputTypeHTMLAttribute): this {
		this.setAttribute("type", ty);
		return this;
	}
}

// ------ //
// Export //
// ------ //

export { HTMLElementExtension };
