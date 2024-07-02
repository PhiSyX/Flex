// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	isBoolean,
	isDOMElement,
	isDOMFragment,
	isDOMInput,
	isDOMNode,
	isPrimitive,
	isString,
} from "@phisyx/flex-asserts";
import { kebabcase } from "@phisyx/flex-capitalization";
import { noopBool } from "@phisyx/flex-helpers";
import { stripTags } from "@phisyx/flex-safety";
import {
	type Computed,
	type Signal,
	isComputed,
	isSignal,
} from "@phisyx/flex-signal";

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
		| HTMLElementExtension;

	export type Args = Array<Arg>;
	export type Primitives = string | number | boolean | bigint;
	export type Fn = () => HTMLElementExtension;
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

type FormMethodVerb = "GET" | "POST";
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

class HTMLElementExtension<E extends HTMLElement | SVGElement = FIXME> {
	public static createHTMLElement<
		T extends keyof HTMLElementTagNameMap,
		NE extends HTMLElementTagNameMap[T],
	>(
		tagName: T,
		args: Array<HTMLElementExtension.Arg>,
	): HTMLElementExtension<NE> {
		let $nativeElement = document.createElement(tagName) as NE;
		return new HTMLElementExtension($nativeElement, args);
	}

	public static createSVGElement<
		T extends keyof SVGElementTagNameMap,
		NE extends SVGElementTagNameMap[T],
	>(
		tagName: T,
		args: Array<HTMLElementExtension.Arg>,
	): HTMLElementExtension<NE> {
		let $nativeElement = document.createElementNS(
			"http://www.w3.org/2000/svg",
			tagName,
		) as NE;
		return new HTMLElementExtension($nativeElement, args);
	}

	public static createFragment(
		children: Array<
			string | HTMLElementExtension | DocumentFragment | Node
		>,
	): HTMLElementExtension {
		let $nativeFragment = document.createDocumentFragment();

		for (let child of children) {
			if (isString(child)) {
				$nativeFragment.append(child);
			} else if (isDOMFragment(child)) {
				$nativeFragment.append(child);
			} else if (isDOMNode(child)) {
				$nativeFragment.append(child);
			} else {
				$nativeFragment.append(child.node());
			}
		}

		// @ts-expect-error : mauvais type.
		return new HTMLElementExtension($nativeFragment, []);
	}

	public static createText(
		text: HTMLElementExtension.Arg,
	): HTMLElementExtension {
		let $nativeElement = document.createElement(
			"output",
		) as unknown as HTMLElement;
		$nativeElement.textContent = text.toString();
		return new HTMLElementExtension($nativeElement.firstChild as FIXME, []);
	}

	#createElementByTypes: Record<
		string,
		(arg: FIXME, replace?: boolean) => boolean
	> = {
		string: this.#createElementFromPrimitive,
		number: this.#createElementFromPrimitive,
		bigint: this.#createElementFromPrimitive,
		boolean: this.#createElementFromPrimitive,
		object: this.#createElementFromObject,
		function: this.#createElementFromFunction,
		symbol: noopBool,
		undefined: noopBool,
	};

	#nativeElement: E;
	#args: Array<HTMLElementExtension.Arg> = [];
	#events: Array<string> = [];
	#children_EX: Array<HTMLElementExtension> = [];
	#children_CE: Array<HTMLElement> = [];
	parent?: HTMLElementExtension;

	constructor(nativeElement: E, args: Array<HTMLElementExtension.Arg>) {
		this.#nativeElement = nativeElement;
		// @ts-expect-error
		this.#nativeElement.extension = this;
		this.#args = args;

		let observer = new MutationObserver(this.observer);

		observer.observe(nativeElement, {
			childList: true,
		});

		this.#handleArgs();
	}

	observer = (records: Array<MutationRecord>) => {
		let added_nodes = (node: HTMLElementExtension.NodeExtension) => {
			let extension = node.extension;

			this.#nativeElement.dispatchEvent(
				new CustomEvent("added:children", {
					detail: extension || node,
				}),
			);

			if (extension == null) {
				return;
			}

			extension.parent = this;
			// this.children_EX.push(extension);
		};

		let removed_nodes = (node: HTMLElementExtension.NodeExtension) => {
			let extension = node.extension;

			this.#nativeElement.dispatchEvent(
				new CustomEvent("deleted:children", {
					detail: extension || node,
				}),
			);

			if (extension == null) {
				return;
			}

			// this.children_CE = this.children_CE.filter((e) => {
			// 	return e.key != extension!.key;
			// });
			// this.children_EX = this.children_EX.filter((e) => {
			// 	return e.key != extension!.key;
			// });
		};

		for (let record of records) {
			record.addedNodes.forEach(added_nodes);
			record.removedNodes.forEach(removed_nodes);
		}
	};

	#handleArgs() {
		for (const arg of this.#args) {
			let createElement = this.#createElementByTypes[typeof arg];
			createElement.call(this, arg);
		}
	}

	#createElementFromPrimitive(
		arg: HTMLElementExtension.Primitives,
		replace?: boolean,
	): boolean {
		const str = arg.toString();

		if (str.startsWith("&") && str.endsWith(";")) {
			let $temp = document.createElement("span");
			$temp.innerHTML = stripTags(str);

			const firstChild = $temp.firstChild as ChildNode;
			this.#nativeElement.append(firstChild);
		} else {
			if (replace) {
				this.#nativeElement.textContent = str;
			} else {
				this.#nativeElement.append(str);
			}
		}

		return true;
	}

	#createElementFromObject(obj: object): boolean {
		if (isComputed(obj)) {
			return this.#handleComputed(obj);
		}

		if (isSignal(obj)) {
			return this.#handleSignal(obj);
		}

		if (isHTMLElementExtension(obj)) {
			return this.#handleSelf(obj);
		}

		if (isDOMElement(obj)) {
			return this.#handleDOMElement(obj);
		}

		if (isDOMNode(obj)) {
			return this.#handleDOMNode(obj);
		}

		for (const [attr, value] of Object.entries(obj)) {
			this.#nativeElement.setAttribute(kebabcase(attr), value);
		}

		return true;
	}

	#handleComputed(arg: Computed): boolean {
		let $ext: HTMLElementExtension<E> = HTMLElementExtension.createText(
			arg.valueOf(),
		);

		this.#nativeElement.append($ext.node());

		const updateDOM = (value: { toString(): string }) =>
			$ext.replaceText(value);
		arg.watch(updateDOM);

		return true;
	}

	#handleSignal(signal: Signal): boolean {
		if (isDOMInput(this.#nativeElement)) {
			this.#nativeElement.value = signal.toString();
			return true;
		}

		let value = signal.valueOf();

		if (isPrimitive(value)) {
			signal.addTriggerElement(document.createTextNode(value.toString()));
		}

		this.#nativeElement.append(signal.lastTriggerElement());

		return true;
	}

	#handleSelf(arg: HTMLElementExtension): boolean {
		this.#nativeElement.append(arg.#nativeElement);
		return true;
	}

	#handleDOMElement(arg: HTMLElement): boolean {
		this.#children_CE.push(arg);
		this.#nativeElement.append(arg);
		return true;
	}

	#handleDOMNode(arg: Node): boolean {
		this.#nativeElement.append(arg);
		return true;
	}

	#createElementFromFunction(argFunction: () => unknown): boolean {
		const arg = argFunction();
		let createElement = this.#createElementByTypes[typeof arg];
		return createElement.call(this, arg);
	}

	defineEventsOnCustomElements(events: Array<string>) {
		this.#events = events;

		for (const evtName of this.#events) {
			for (const children of this.#children_CE) {
				// @ts-expect-error CustomEvent.
				children.addEventListener(evtName, (evt: CustomEvent) => {
					this.#nativeElement.dispatchEvent(
						new CustomEvent(evtName, { detail: evt.detail }),
					);
				});
			}
		}
	}

	/**
	 * Public API
	 */

	action(uri: `/${string}` | `http://${string}` | `https://${string}`): this {
		this.#nativeElement.setAttribute("action", uri);
		return this;
	}

	class(rawClassName: string): this {
		const classNames = rawClassName.split(" ");
		this.#nativeElement.classList.add(...classNames);
		return this;
	}

	displayWhen(sig: Signal<boolean>): this;
	displayWhen(sig: Computed<boolean>): this;
	displayWhen(sig: boolean): this;
	displayWhen(sig: unknown): this {
		const updateDisplay = (when: boolean) => {
			if (when) {
				this.#nativeElement.style.display = "block";
			} else {
				this.#nativeElement.style.display = "none";
			}
		};

		if (isSignal<boolean>(sig)) {
			sig.addCallback((_, newValue) => {
				updateDisplay(newValue);
			});

			updateDisplay(sig.valueOf());
		} else if (isComputed(sig)) {
			sig.watch((a) => updateDisplay(a), { immediate: true });
		} else if (isBoolean(sig)) {
			updateDisplay(sig);
		}

		return this;
	}

	for(id: `#${string}`): this {
		this.#nativeElement.setAttribute("for", id.slice(1));
		return this;
	}

	form(formID?: string): this {
		if (formID) this.#nativeElement.setAttribute("form", formID);
		return this;
	}

	id(id: `#${string}`): this {
		this.#nativeElement.id = id.slice(1);
		return this;
	}

	method<Verb extends FormMethodVerb>(httpVerb: Uppercase<Verb>): this;
	method<Verb extends FormMethodVerb>(httpVerb: Lowercase<Verb>): this;
	method<Verb extends FormMethodVerb>(httpVerb: Verb): this {
		this.#nativeElement.setAttribute("method", httpVerb);
		return this;
	}

	model<M extends HTMLElementExtension.Primitives>(signal: Signal<M>): this {
		signal.watch((model) => this.#handleSignal(model), { immediate: true });

		this.#nativeElement.addEventListener("input", (evt) => {
			// @ts-expect-error - We know that the input event is only triggered
			// on form elements, and that they have the property (`value` in
			// `EventTarget`) in their object.
			signal.set(evt.target.value);
		});

		return this;
	}

	name(name: string): this {
		this.#nativeElement.setAttribute("name", name);
		return this;
	}

	value(value: unknown): this {
		this.#nativeElement.setAttribute("value", String(value));
		return this;
	}

	type(ty: InputTypeHTMLAttribute): this {
		this.#nativeElement.setAttribute("type", ty);
		return this;
	}

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
		this.#nativeElement.addEventListener(
			type,
			listener.bind(this),
			options,
		);
		return this;
	}

	onClick(fn: (evt: MouseEvent) => void): this {
		this.#nativeElement.addEventListener("click", fn);
		return this;
	}

	onSubmit(fn: (evt: SubmitEvent) => void): this {
		this.#nativeElement.addEventListener("submit", fn);
		return this;
	}

	submitWith(params: {
		success?: (evt: SubmitEvent, res: Response) => void;
		failure?: (evt: SubmitEvent, err: unknown) => void;
		xhrOptions?: Omit<RequestInit, "method" | "body">;
	}): this {
		return this.onSubmit(function (this: HTMLFormElement, evt) {
			let body: BodyInit | undefined = undefined;

			if (this.method.toUpperCase() === "POST") {
				body = new FormData(this);
			}

			evt.preventDefault();

			fetch(this.action, {
				...params.xhrOptions,
				method: this.method,
				body,
			})
				.then((res) => params.success?.(evt, res))
				.catch((err) => params.failure?.(evt, err));
		});
	}

	extendsAttrs(attrs: NamedNodeMap): this {
		const excludesAttributes = ["model", "style"];

		for (const attr of attrs) {
			if (excludesAttributes.includes(attr.name)) continue;
			this.#nativeElement.setAttribute(kebabcase(attr.name), attr.value);
		}

		return this;
	}

	replaceText($1: { toString(): string }): this {
		this.#nativeElement.textContent = $1.toString();
		return this;
	}

	node(): E {
		return this.#nativeElement;
	}
}

// -------- //
// Fonction //
// -------- //

function isHTMLElementExtension(value: unknown): value is HTMLElementExtension {
	return value instanceof HTMLElementExtension;
}

// ------ //
// Export //
// ------ //

export { HTMLElementExtension };
