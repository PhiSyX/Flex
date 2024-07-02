// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { isBoolean } from "@phisyx/flex-asserts";
import { kebabcase } from "@phisyx/flex-capitalization";
import {
	type Computed,
	type Signal,
	isComputed,
	isSignal,
} from "@phisyx/flex-signal";
import { ElementExtension } from "./_ext";

// --------- //
// Interface //
// --------- //

// biome-ignore lint/suspicious/noExplicitAny: fait par un professionnel (ou pas) ;-).
type FIXME = any;

namespace SVGElementExtension {
	export type Arg =
		| Primitives
		| Fn
		| Sig
		| Com
		| SVGElement
		| SVGElementExtension;

	export type Args = Array<Arg>;
	export type Primitives = string | number | boolean | bigint;
	export type Fn = () => SVGElementExtension;
	export type Sig = Signal;
	export type Com = Computed;
	export type Self = SVGElementExtension;

	export type NodeExtension = Node & { extension?: SVGElementExtension };

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
	> = K extends keyof SVGElementEventMap
		? (this: Self, evt: TargetedEvent<T, SVGElementEventMap[K]>) => void
		: (this: Self, evt: CustomEvent) => void;
}

// -------------- //
// Implémentation //
// -------------- //

class SVGElementExtension<
	E extends SVGElement = FIXME,
> extends ElementExtension<E> {
	public static createElement<
		T extends keyof SVGElementTagNameMap,
		NE extends SVGElementTagNameMap[T],
	>(
		tagName: T,
		args: Array<SVGElementExtension.Arg>,
	): SVGElementExtension<NE> {
		let $nativeElement = document.createElementNS(
			"http://www.w3.org/2000/svg",
			tagName,
		) as NE;
		return new SVGElementExtension($nativeElement, args);
	}

	/**
	 * Public API
	 */

	d(value: string): this {
		this.setAttribute("d", value);
		return this;
	}

	fill(value: "currentColor"): this;
	fill(value: string): this {
		this.setAttribute("fill", value);
		return this;
	}

	height(h: number): this {
		this.setAttribute("height", h);
		return this;
	}

	on<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: SVGElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	on<K>(
		type: K,
		listener: SVGElementExtension.ChooseGoodEvent<E, K>,
		options?: boolean | AddEventListenerOptions,
	): this;
	on(
		type: FIXME,
		listener: SVGElementExtension.ChooseGoodEvent<E, FIXME>,
		options?: boolean | AddEventListenerOptions,
	): this {
		this.nativeElement.addEventListener(type, listener.bind(this), options);
		return this;
	}

	onClick(fn: (evt: MouseEvent) => void): this {
		this.nativeElement.addEventListener("click", fn);
		return this;
	}

	viewBox(box: string): this {
		this.setAttribute("viewBox", box);
		return this;
	}

	width(w: number): this {
		this.setAttribute("width", w);
		return this;
	}
}

// -------- //
// Fonction //
// -------- //

function isHTMLElementExtension(value: unknown): value is SVGElementExtension {
	return value instanceof SVGElementExtension;
}

// ------ //
// Export //
// ------ //

export { SVGElementExtension };
