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

import {
	is_boolean,
	is_dom_element,
	is_dom_fragment,
	is_dom_input,
	is_dom_node,
	is_function,
	is_future,
	is_primitive,
	is_string,
} from "@phisyx/flex-asserts";
import { kebabcase } from "@phisyx/flex-capitalization";
import { noop_bool } from "@phisyx/flex-helpers";
import { is_option, strip_tags } from "@phisyx/flex-safety";
import { is_computed, is_signal } from "@phisyx/flex-signal";

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
		| Node
		| Option<Arg>
		| Promise<Arg>;

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

class ElementExtension<E extends HTMLElement | SVGElement = FIXME>
{
	public static create_fragment(
		children: Array<
			string | ElementExtension | DocumentFragment | Node
		> = [],
	): ElementExtension
	{
		let $native_fragment = document.createDocumentFragment();

		for (let child of children) {
			if (is_function<Node>(child)) {
				$native_fragment.append(child());
			} else if (is_string(child)) {
				$native_fragment.append(child);
			} else if (is_dom_fragment(child)) {
				$native_fragment.append(child);
			} else if (is_dom_node(child)) {
				$native_fragment.append(child);
			} else {
				$native_fragment.append(child.node());
			}
		}

		// @ts-expect-error : mauvais type.
		return new ElementExtension($native_fragment, []);
	}

	public static create_text(text: ElementExtension.Arg): ElementExtension
	{
		let $native_element = document.createElement(
			"output",
		) as unknown as HTMLElement;
		$native_element.textContent = text.toString();
		return new ElementExtension($native_element.firstChild as FIXME, []);
	}

	#create_element_by_types: Record<
		string,
		(arg: FIXME, replace?: boolean) => boolean
	> = {
		string: this.#create_element_from_primitive,
		number: this.#create_element_from_primitive,
		bigint: this.#create_element_from_primitive,
		boolean: this.#create_element_from_primitive,
		object: this.#create_element_from_object,
		function: this.#create_element_from_function,
		symbol: noop_bool,
		undefined: noop_bool,
	};

	protected native_element: E;
	#args: Array<ElementExtension.Arg> = [];
	#events: Array<string> = [];
	#children_EX: Array<ElementExtension> = [];
	#children_CE: Array<HTMLElement> = [];
	parent?: ElementExtension;

	constructor(native_element: E, args: Array<ElementExtension.Arg>)
	{
		this.native_element = native_element;
		// @ts-expect-error
		this.native_element.extension = this;
		this.#args = args;

		let observer = new MutationObserver(this.observer);

		observer.observe(native_element, {
			childList: true,
		});

		this.#handle_args();
	}

	observer = (records: Array<MutationRecord>) =>
	{
		let added_nodes = (node: ElementExtension.NodeExtension) => {
			let extension = node.extension;

			this.native_element.dispatchEvent(
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

			this.native_element.dispatchEvent(
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

	#handle_args(args: ElementExtension.Args = this.#args)
	{
		for (let arg of args) {
			let create_element = this.#create_element_by_types[typeof arg];
			create_element.call(this, arg);
		}
	}

	#create_element_from_primitive(
		arg: ElementExtension.Primitives,
		replace?: boolean,
	): boolean
	{
		let str = arg.toString();

		if (str.startsWith("&") && str.endsWith(";")) {
			let $temp = document.createElement("span");
			$temp.innerHTML = strip_tags(str);

			let first_child = $temp.firstChild as ChildNode;
			this.native_element.append(first_child);
		} else {
			if (replace) {
				this.native_element.textContent = str;
			} else {
				this.native_element.append(str);
			}
		}

		return true;
	}

	#create_element_from_object(obj: object): boolean
	{
		if (is_computed(obj)) {
			return this.#handle_computed(obj);
		}

		if (is_signal(obj)) {
			return this.handle_signal(obj);
		}

		if (is_element_extension(obj)) {
			return this.#handle_self(obj);
		}

		if (is_dom_element(obj)) {
			return this.#handle_dom_element(obj);
		}

		if (is_dom_node(obj)) {
			return this.#handle_dom_node(obj);
		}

		if (is_option<FIXME>(obj)) {
			obj.then((self) => this.#handle_args([self]));
			return true;
		}

		if (is_future<FIXME>(obj)) {
			obj.then((self) => this.#handle_args([self]));
			return true;
		}

		for (let [attr, value] of Object.entries(obj)) {
			if (is_primitive(value)) {
				this.native_element.setAttribute(kebabcase(attr), value);
			} else {
				this.native_element.setAttribute(
					kebabcase(attr),
					JSON.stringify(value),
				);
			}
		}

		return true;
	}

	#handle_computed(arg: Computed): boolean
	{
		let value = arg.valueOf();

		if (is_element_extension(value)) {
			this.native_element.append(value.node());

			return true;
		}

		let $ext: ElementExtension<E> = ElementExtension.create_text(
			arg.valueOf(),
		);

		this.native_element.append($ext.node());

		let update_dom = (value: { toString(): string }) => $ext.replace_text(value);
		arg.watch(update_dom);

		return true;
	}

	protected handle_signal(signal: Signal): boolean
	{
		if (is_dom_input(this.native_element)) {
			this.native_element.value = signal.toString();
			return true;
		}

		let value = signal.valueOf();

		if (is_primitive(value)) {
			signal.add_trigger_element(document.createTextNode(value.toString()));
		}

		this.native_element.append(signal.last_triggered_element());

		return true;
	}

	#handle_self(arg: ElementExtension): boolean
	{
		this.native_element.append(arg.native_element);
		return true;
	}

	#handle_dom_element(arg: HTMLElement): boolean
	{
		this.#children_CE.push(arg);
		this.native_element.append(arg);
		return true;
	}

	#handle_dom_node(arg: Node): boolean
	{
		this.native_element.append(arg);
		return true;
	}

	#create_element_from_function(arg_function: () => unknown): boolean
	{
		let arg = arg_function();
		let create_element = this.#create_element_by_types[typeof arg];
		return create_element.call(this, arg);
	}

	defineEventsOnCustomElements(events: Array<string>)
	{
		this.#events = events;

		for (let event_name of this.#events) {
			for (let children of this.#children_CE) {
				// @ts-expect-error CustomEvent.
				children.addEventListener(event_name, (evt: CustomEvent) => {
					this.native_element.dispatchEvent(
						new CustomEvent(event_name, { detail: evt.detail }),
					);
				});
			}
		}
	}

	protected set_attribute(key: string, value: unknown): this
	{
		if (value) {
			this.native_element.setAttribute(key.toLowerCase(), String(value));
		}
		return this;
	}

	node(): E
	{
		return this.native_element;
	}

	append(self: ElementExtension<E> | Promise<ElementExtension<E>>)
	{
		let create_element = this.#create_element_by_types[typeof self];
		create_element.call(this, self);
	}

	/**
	 * Public API
	 */

	display_when(sig: Signal<boolean>): this;
	display_when(sig: Computed<boolean>): this;
	display_when(sig: boolean): this;
	display_when(sig: unknown): this
	{
		let update_display = (when: boolean) => {
			if (when) {
				this.native_element.style.display = "block";
			} else {
				this.native_element.style.display = "none";
			}
		};

		if (is_signal<boolean>(sig)) {
			sig.add_callback((_, new_value) => {
				update_display(new_value);
			});

			update_display(sig.valueOf());
		} else if (is_computed(sig)) {
			sig.watch((a) => update_display(a), { immediate: true });
		} else if (is_boolean(sig)) {
			update_display(sig);
		}

		return this;
	}

	extends_attrs(attrs: NamedNodeMap): this
	{
		let excludes_attributes = ["model", "style"];

		for (let attr of attrs) {
			if (excludes_attributes.includes(attr.name)) {
				continue;
			}
			this.native_element.setAttribute(kebabcase(attr.name), attr.value);
		}

		return this;
	}

	class(raw_class_name: string | Record<PropertyKey, unknown>): this
	{
		if (is_string(raw_class_name)) {
			let class_names = raw_class_name.split(" ");
			this.native_element.classList.add(...class_names);
		} else {
			let temp: unknown;
			let str = "";
			let size = Object.keys(raw_class_name).length;
			for (let i = 0; i < size; i++) {
				temp = raw_class_name[i];
				if (temp) {
					if (typeof temp === "string") {
						str += (str && " ") + temp;
					}
				}
			}
		}
		return this;
	}

	data(dataset: Record<string, string | Option<string>>): this
	{
		for (let [key, value] of Object.entries(dataset)) {
			if (is_option(value)) {
				if (value.is_some()) {
					this.native_element.dataset[key] = value.unwrap();
				}
			} else {
				this.native_element.dataset[key] = value;
			}
		}
		return this;
	}

	id(id: `#${string}`): this
	{
		this.native_element.id = id.slice(1);
		return this;
	}

	only_if(condition: boolean): this
	{
		// @ts-expect-error à corriger
		if (!condition) this.native_element.lastElementChild.remove();
		return this;
	}

	replace_text($1: { toString(): string }): this
	{
		this.native_element.textContent = $1.toString();
		return this;
	}

	slot(name: string): this
	{
		this.set_attribute("slot", name);
		return this;
	}

	title(value: { toString(): string }): this
	{
		this.set_attribute("title", value.toString());
		return this;
	}
}

// -------- //
// Fonction //
// -------- //

function is_element_extension(value: unknown): value is ElementExtension
{
	return value instanceof ElementExtension;
}

// ------ //
// Export //
// ------ //

export { ElementExtension };
