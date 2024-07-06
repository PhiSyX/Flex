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
	isFunction,
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

namespace ElementExtension {
	export type Arg =
		| Primitives
		| Fn
		| Sig
		| Com
		| SVGElement
		| HTMLElement
		| ElementExtension
		| Node;

	export type Args = Array<Arg>;
	export type Primitives = string | number | boolean | bigint;
	export type Fn = () => ElementExtension | Element | Node;
	export type Sig = Signal;
	export type Com = Computed;
	export type Self = ElementExtension;

	export type NodeExtension = Node & { extension?: ElementExtension };
}

// -------------- //
// Implémentation //
// -------------- //

class ElementExtension<E extends HTMLElement | SVGElement = FIXME> {
	public static createFragment(
		children: Array<string | ElementExtension | DocumentFragment | Node>,
	): ElementExtension {
		let $nativeFragment = document.createDocumentFragment();

		for (let child of children) {
			if (isFunction<Node>(child)) {
				$nativeFragment.append(child());
			} else if (isString(child)) {
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
		return new ElementExtension($nativeFragment, []);
	}

	public static createText(text: ElementExtension.Arg): ElementExtension {
		let $nativeElement = document.createElement(
			"output",
		) as unknown as HTMLElement;
		$nativeElement.textContent = text.toString();
		return new ElementExtension($nativeElement.firstChild as FIXME, []);
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

	protected nativeElement: E;
	#args: Array<ElementExtension.Arg> = [];
	#events: Array<string> = [];
	#children_EX: Array<ElementExtension> = [];
	#children_CE: Array<HTMLElement> = [];
	parent?: ElementExtension;

	constructor(nativeElement: E, args: Array<ElementExtension.Arg>) {
		this.nativeElement = nativeElement;
		// @ts-expect-error
		this.nativeElement.extension = this;
		this.#args = args;

		let observer = new MutationObserver(this.observer);

		observer.observe(nativeElement, {
			childList: true,
		});

		this.#handleArgs();
	}

	observer = (records: Array<MutationRecord>) => {
		let added_nodes = (node: ElementExtension.NodeExtension) => {
			let extension = node.extension;

			this.nativeElement.dispatchEvent(
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

		let removed_nodes = (node: ElementExtension.NodeExtension) => {
			let extension = node.extension;

			this.nativeElement.dispatchEvent(
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
		arg: ElementExtension.Primitives,
		replace?: boolean,
	): boolean {
		const str = arg.toString();

		if (str.startsWith("&") && str.endsWith(";")) {
			let $temp = document.createElement("span");
			$temp.innerHTML = stripTags(str);

			const firstChild = $temp.firstChild as ChildNode;
			this.nativeElement.append(firstChild);
		} else {
			if (replace) {
				this.nativeElement.textContent = str;
			} else {
				this.nativeElement.append(str);
			}
		}

		return true;
	}

	#createElementFromObject(obj: object): boolean {
		if (isComputed(obj)) {
			return this.#handleComputed(obj);
		}

		if (isSignal(obj)) {
			return this.handleSignal(obj);
		}

		if (isElementExtension(obj)) {
			return this.#handleSelf(obj);
		}

		if (isDOMElement(obj)) {
			return this.#handleDOMElement(obj);
		}

		if (isDOMNode(obj)) {
			return this.#handleDOMNode(obj);
		}

		for (const [attr, value] of Object.entries(obj)) {
			this.nativeElement.setAttribute(kebabcase(attr), value);
		}

		return true;
	}

	#handleComputed(arg: Computed): boolean {
		const value = arg.valueOf();

		if (isElementExtension(value)) {
			this.nativeElement.append(value.node());

			return true;
		}

		let $ext: ElementExtension<E> = ElementExtension.createText(
			arg.valueOf(),
		);

		this.nativeElement.append($ext.node());

		const updateDOM = (value: { toString(): string }) =>
			$ext.replaceText(value);
		arg.watch(updateDOM);

		return true;
	}

	protected handleSignal(signal: Signal): boolean {
		if (isDOMInput(this.nativeElement)) {
			this.nativeElement.value = signal.toString();
			return true;
		}

		let value = signal.valueOf();

		if (isPrimitive(value)) {
			signal.addTriggerElement(document.createTextNode(value.toString()));
		}

		this.nativeElement.append(signal.lastTriggerElement());

		return true;
	}

	#handleSelf(arg: ElementExtension): boolean {
		this.nativeElement.append(arg.nativeElement);
		return true;
	}

	#handleDOMElement(arg: HTMLElement): boolean {
		this.#children_CE.push(arg);
		this.nativeElement.append(arg);
		return true;
	}

	#handleDOMNode(arg: Node): boolean {
		this.nativeElement.append(arg);
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
					this.nativeElement.dispatchEvent(
						new CustomEvent(evtName, { detail: evt.detail }),
					);
				});
			}
		}
	}

	protected setAttribute(key: string, value: unknown) {
		if (value) {
			this.nativeElement.setAttribute(key.toLowerCase(), String(value));
		}
	}

	node(): E {
		return this.nativeElement;
	}

	/**
	 * Public API
	 */

	displayWhen(sig: Signal<boolean>): this;
	displayWhen(sig: Computed<boolean>): this;
	displayWhen(sig: boolean): this;
	displayWhen(sig: unknown): this {
		const updateDisplay = (when: boolean) => {
			if (when) {
				this.nativeElement.style.display = "block";
			} else {
				this.nativeElement.style.display = "none";
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

	extendsAttrs(attrs: NamedNodeMap): this {
		const excludesAttributes = ["model", "style"];

		for (const attr of attrs) {
			if (excludesAttributes.includes(attr.name)) continue;
			this.nativeElement.setAttribute(kebabcase(attr.name), attr.value);
		}

		return this;
	}

	class(rawClassName: string | Record<PropertyKey, unknown>): this {
		if (isString(rawClassName)) {
			const classNames = rawClassName.split(" ");
			this.nativeElement.classList.add(...classNames);
		} else {
			let temp: unknown;
			let str = "";
			let size = Object.keys(rawClassName).length;
			for (let i = 0; i < size; i++) {
				temp = rawClassName[i];
				if (temp) {
					if (typeof temp === "string") {
						str += (str && " ") + temp;
					}
				}
			}
		}
		return this;
	}

	id(id: `#${string}`): this {
		this.nativeElement.id = id.slice(1);
		return this;
	}

	replaceText($1: { toString(): string }): this {
		this.nativeElement.textContent = $1.toString();
		return this;
	}

	onlyIf(condition: boolean): this {
		if (!condition) this.nativeElement.lastElementChild.remove();
		return this;
	}

	title(value: { toString(): string }): this {
		this.setAttribute("title", value.toString());
		return this;
	}
}

// -------- //
// Fonction //
// -------- //

function isElementExtension(value: unknown): value is ElementExtension {
	return value instanceof ElementExtension;
}

// ------ //
// Export //
// ------ //

export { ElementExtension };
