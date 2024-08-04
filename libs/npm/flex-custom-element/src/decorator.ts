// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { AttachShadowMode } from "./global";
import type { CustomElementConstructor, CustomElementInterface } from "./type";

import { camelcase, kebabcase } from "@phisyx/flex-capitalization";
import { is_signal } from "@phisyx/flex-signal";

import { GlobalCustomElement } from "./global";

// ---- //
// Type //
// ---- //

// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

interface CustomElementDecoratorOptions
{
	/**
	 * Name of an native HTML element to be extended.
	 */
	extends?: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
	/**
	 * Shadow DOM tree encapsulation mode.
	 */
	mode?: AttachShadowMode;
	/**
	 * Stylesheets of the custom elements
	 */
	styles?: Array<string>;
};

function assert_shadow_root(_: FIXME): asserts _ is ShadowRoot
{}

export function customElement(options?: CustomElementDecoratorOptions)
{
	function Ctor<
		UCE extends CustomElementConstructor<UCEInstance>,
		UCEInstance extends CustomElementInterface,
	>(UserCustomElement: UCE)
	{
		function custom_event_name(name: string): `handle${string}Event`
		{
			let capitalized = camelcase(name, {
				includes_separators: false,
			});
			return `handle${capitalized}Event`;
		}

		return class LocalCustomElement extends GlobalCustomElement
		{
			public static options: ElementDefinitionOptions | undefined = {
				extends: options?.extends,
			};

			static get observedAttributes(): Array<string>
			{
				return UserCustomElement.props || [];
			}

			static get name()
			{
				return UserCustomElement.name;
			}

			static get TAG_NAME()
			{
				return kebabcase(UserCustomElement.name);
			}

			public element!: UCEInstance;

			static STYLESHEETS: Map<string, CSSStyleSheet> = new Map();

			constructor()
			{
				super(options?.mode || "closed");

				this.element = new UserCustomElement(this);
				this.element.customElement = this;

				let apply_stylesheets = (doc: {
					adoptedStyleSheets: Array<CSSStyleSheet>;
				}) => {
					// @ts-expect-error ;)
					for (let stylesheet of options.styles) {
						if (
							this.mode === "open" &&
							LocalCustomElement.STYLESHEETS.has(stylesheet)
						) {
							doc.adoptedStyleSheets.push(
								// biome-ignore lint/style/noNonNullAssertion: condition ci-haut.
								LocalCustomElement.STYLESHEETS.get(stylesheet)!,
							);
							continue;
						}

						if (
							stylesheet.indexOf(".css") >= 0 ||
							stylesheet.indexOf(".scss") >= 0
						) {
							let sheet = new CSSStyleSheet();
							LocalCustomElement.STYLESHEETS.set(
								stylesheet,
								sheet,
							);

							fetch(stylesheet, {
								headers: { accept: "text/css" },
							})
								.then((r) => r.text())
								.then((s) => sheet.replace(s));

							doc.adoptedStyleSheets.push(sheet);
						} else {
							let sheet = new CSSStyleSheet();
							sheet.replaceSync(stylesheet);
							doc.adoptedStyleSheets.push(sheet);
						}
					}
				};

				if (options?.styles) {
					if (this.mode === "open") {
						assert_shadow_root(this.root);
						apply_stylesheets(this.root);
					} else {
						apply_stylesheets(document);
					}
				}
			}

			render()
			{
				let $extension = this.element.render();
				this.root.appendChild($extension.node());
				return $extension;
			}

			update()
			{
				super.update();

				if (this.root.firstChild) {
					this.root.removeChild(this.root.firstChild);
					this.connectedCallback();
				}
			}

			connectedCallback()
			{
				this.element.mounted?.();

				let $extension = this.render();

				let events = UserCustomElement.events || [];
				$extension.defineEventsOnCustomElements(events);

				for (let evtName of events) {
					let methodName = custom_event_name(evtName);

					// @ts-expect-error : TODO
					if (!this.element[methodName]) {
						console.error(
							"La méthode «",
							methodName,
							"»",
							"n'existe pas sur «",
							this,
							"»",
						);
						break;
					}

					// @ts-expect-error : TODO
					$extension.on(evtName, (evt) => {
						// @ts-expect-error : TODO
						this.element[methodName].call(this.element, evt);
					});
				}

				if (this.mode === "closed") {
					this.appendChild($extension.node());
				}
			}

			attributeChangedCallback(
				attribute_name: string,
				attribute_old_value: string | null,
				attribute_new_value: string | null,
			)
			{
				if (UserCustomElement.props?.includes(attribute_name)) {
					let prop = (this.element as FIXME)[attribute_name];

					if (!prop) {
						return;
					}

					if (!is_signal(prop)) {
						// FIXME: améliorer cette partie.
						(this.element as FIXME)[attribute_name] = JSON.parse(
							// biome-ignore lint/style/noNonNullAssertion: ;-)
							attribute_new_value!,
						);
						this.update();
					} else {
						prop.set(attribute_new_value || "");
					}
				}

				this.element.updatedAttribute?.(
					attribute_name,
					attribute_old_value,
					attribute_new_value,
				);
			}

			disconnectedCallback()
			{
				this.element.unmounted?.();
			}
		} as unknown as UCE;
	}

	return Ctor;
}

interface AttrDecoratorOptions
{
	parser?:
		| (<T>(...args: FIXME[]) => T)
		| BooleanConstructor
		| StringConstructor
		| NumberConstructor;
};

export function attr<T extends CustomElementInterface>(
	options?: AttrDecoratorOptions,
)
{
	let default_parser = (v: unknown) => v;
	let parser = options?.parser || default_parser;
	return (_: T, property_name: string, descriptor: PropertyDescriptor) => {
		let property_name_kb = kebabcase(property_name);
		let origin_getter = descriptor.get;
		descriptor.get = function (this: T) {
			return parser(
				this.customElement?.getAttribute(property_name_kb) ??
					origin_getter?.call(this),
			);
		};
	};
}
