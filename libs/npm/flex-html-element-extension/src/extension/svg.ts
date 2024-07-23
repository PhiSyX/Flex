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
import type { Computed, Signal } from "@phisyx/flex-signal";
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
		| SVGElementExtension
		| Node
		| Option<Arg>
		| Promise<Arg>;

	export type Args = Array<Arg>;
	export type Primitives = string | number | boolean | bigint;
	export type Fn = () => SVGElementExtension | SVGElement;
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

type SVGPreserveAspectRatioAlignment =
	| "none"
	| "xMinYMin"
	| "xMidYMin"
	| "xMaxYMin"
	| "xMinYMid"
	| "xMidYMid"
	| "xMaxYMid"
	| "xMinYMax"
	| "xMidYMax"
	| "xMaxYMax";

type SVGPreserveAspectRatioMeetOrSlice = "meet" | "slice";

type SVGPreserveAspectRatio =
	| SVGPreserveAspectRatioAlignment
	| SVGPreserveAspectRatioMeetOrSlice
	| `${SVGPreserveAspectRatioAlignment} ${SVGPreserveAspectRatioMeetOrSlice}`;

type SVGStrokeLineCap = "butt" | "round" | "square";

type SVGClockValue =
	| `${number}h`
	| `${number}min`
	| `${number}s`
	| `${number}ms`;

type SVGDur = SVGClockValue | "media" | "indefinite";

type SVGType = "translate" | "scale" | "rotate" | "skewX" | "skewY";

type SVGRepeatCount = number | "indefinite";

type SVGKeyTimes = number | `${number};${number}`;

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
		$nativeElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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
	fill(value: "none"): this;
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

	preserveAspectRatio(aspectRatio: SVGPreserveAspectRatio): this {
		this.setAttribute("preserveAspectRatio", aspectRatio);
		return this;
	}

	stroke(color: `#${string}`): this {
		this.setAttribute("stroke", color);
		return this;
	}

	strokeDashArray(da: string): this {
		this.setAttribute("stroke-dasharray", da);
		return this;
	}

	strokeDashOffset(dof: string): this {
		this.setAttribute("stroke-dashoffset", dof);
		return this;
	}

	strokeLineCap(lc: SVGStrokeLineCap): this {
		this.setAttribute("stroke-linecap", lc);
		return this;
	}

	strokeWidth(width: number): this {
		this.setAttribute("stroke-width", width);
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

	xmlns_1999_xlink(): this {
		this.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
		return this;
	}
}

export class AnimateTransformSVGElementExtension extends SVGElementExtension<SVGAnimateTransformElement> {
	static make(
		args: SVGElementExtension.Args,
	): AnimateTransformSVGElementExtension {
		return new AnimateTransformSVGElementExtension(args);
	}

	constructor(args: SVGElementExtension.Args) {
		super(
			document.createElementNS(
				"http://www.w3.org/2000/svg",
				"animateTransform",
			),
			args,
		);
	}

	/*
	 * Public API
	 */

	attributeName(name: string): this {
		this.setAttribute("attributeName", name);
		return this;
	}

	dur(value: SVGDur): this {
		this.setAttribute("dur", value);
		return this;
	}

	keyTimes(value: SVGKeyTimes): this {
		this.setAttribute("keyTimes", value);
		return this;
	}

	repeatCount(value: SVGRepeatCount): this {
		this.setAttribute("repeatCount", value);
		return this;
	}

	type(value: SVGType): this {
		this.setAttribute("type", value);
		return this;
	}

	values(value: string): this {
		this.setAttribute("values", value);
		return this;
	}
}

export class CircleSVGElementExtension extends SVGElementExtension<SVGCircleElement> {
	static make(args: SVGElementExtension.Args): CircleSVGElementExtension {
		return new CircleSVGElementExtension(args);
	}

	constructor(args: SVGElementExtension.Args) {
		super(
			document.createElementNS("http://www.w3.org/2000/svg", "circle"),
			args,
		);
	}

	/*
	 * Public API
	 */

	cx(value: number): this {
		this.setAttribute("cx", value);
		return this;
	}

	cy(value: number): this {
		this.setAttribute("cy", value);
		return this;
	}

	r(value: number): this {
		this.setAttribute("r", value);
		return this;
	}
}

// ------ //
// Export //
// ------ //

export { SVGElementExtension };
