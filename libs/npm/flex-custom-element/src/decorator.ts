// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { camelCase, kebabcase } from "@phisyx/flex-capitalization";
import { isSignal } from "@phisyx/flex-signal";

import { type AttachShadowMode, GlobalCustomElement } from "./global";
import type { CustomElementConstructor, CustomElementInterface } from "./type";

// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

type CustomElementDecoratorOptions = {
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

function assertShadowRoot(_: FIXME): asserts _ is ShadowRoot {}

export function customElement(options?: CustomElementDecoratorOptions) {
	function Ctor<
		UCE extends CustomElementConstructor<UCEInstance>,
		UCEInstance extends CustomElementInterface,
	>(UserCustomElement: UCE) {
		function customEventName(name: string): `handle${string}Event` {
			let capitalized = camelCase(name, {
				includes_separators: false,
			});
			return `handle${capitalized}Event`;
		}

		return class LocalCustomElement extends GlobalCustomElement {
			public static options: ElementDefinitionOptions | undefined = {
				extends: options?.extends,
			};

			static get observedAttributes(): Array<string> {
				return UserCustomElement.props || [];
			}

			static get name() {
				return UserCustomElement.name;
			}

			static get TAG_NAME() {
				return kebabcase(UserCustomElement.name);
			}

			public element!: UCEInstance;

			static STYLESHEETS: Map<string, CSSStyleSheet> = new Map();

			constructor() {
				super(options?.mode || "closed");

				this.element = new UserCustomElement(this);
				this.element.customElement = this;

				const applyStylesheets = (doc: {
					adoptedStyleSheets: Array<CSSStyleSheet>;
				}) => {
					// @ts-expect-error ;)
					for (const stylesheet of options.styles) {
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
							const sheet = new CSSStyleSheet();
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
							const sheet = new CSSStyleSheet();
							sheet.replaceSync(stylesheet);
							doc.adoptedStyleSheets.push(sheet);
						}
					}
				};

				if (options?.styles) {
					if (this.mode === "open") {
						assertShadowRoot(this.root);
						applyStylesheets(this.root);
					} else {
						applyStylesheets(document);
					}
				}
			}

			render() {
				let $extension = this.element.render();
				this.root.appendChild($extension.node());
				return $extension;
			}

			update() {
				super.update();

				if (this.root.firstChild) {
					this.root.removeChild(this.root.firstChild);
					this.connectedCallback();
				}
			}

			connectedCallback() {
				this.element.mounted?.();

				let $extension = this.render();

				let events = UserCustomElement.events || [];
				$extension.defineEventsOnCustomElements(events);

				for (let evtName of events) {
					let methodName = customEventName(evtName);

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
				attributeName: string,
				attributeOldValue: string | null,
				attributeNewValue: string | null,
			) {
				if (UserCustomElement.props?.includes(attributeName)) {
					let prop = (this.element as FIXME)[attributeName];

					if (!prop) return;

					if (!isSignal(prop)) {
						// FIXME: améliorer cette partie.
						(this.element as FIXME)[attributeName] = JSON.parse(
							// biome-ignore lint/style/noNonNullAssertion: ;-)
							attributeNewValue!,
						);
						this.update();
					} else {
						prop.set(attributeNewValue || "");
					}
				}

				this.element.updatedAttribute?.(
					attributeName,
					attributeOldValue,
					attributeNewValue,
				);
			}

			disconnectedCallback() {
				this.element.unmounted?.();
			}
		} as unknown as UCE;
	}

	return Ctor;
}

type AttrDecoratorOptions = {
	parser?:
		| (<T>(...args: FIXME[]) => T)
		| BooleanConstructor
		| StringConstructor
		| NumberConstructor;
};

export function attr<T extends CustomElementInterface>(
	options?: AttrDecoratorOptions,
) {
	const defaultParser = (v: unknown) => v;
	const parser = options?.parser || defaultParser;
	return (_: T, propertyName: string, descriptor: PropertyDescriptor) => {
		const propertyNameKb = kebabcase(propertyName);
		const originGetter = descriptor.get;
		descriptor.get = function (this: T) {
			return parser(
				this.customElement?.getAttribute(propertyNameKb) ??
					originGetter?.call(this),
			);
		};
	};
}
