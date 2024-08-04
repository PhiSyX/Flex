// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	HTMLElementExtension,
	SVGElementExtension,
} from "@phisyx/flex-html-element-extension";

import type { GlobalCustomElement } from "./global";

// --------- //
// Interface //
// --------- //

export interface CustomElementConstructor<I extends CustomElementInterface>
{
	new (_: GlobalCustomElement): I;

	/**
	 * Dynamic attributes (aka. observedAttributes)
	 */
	props?: Array<string>;

	/**
	 * Allowed events
	 */
	events?: Array<string>;
}

export interface CustomElementInterface
{
	customElement?: GlobalCustomElement;

	mounted?: () => void;
	unmounted?: () => void;

	/**
	 * When the attributes of the custom element change. These attributes MUST
	 * be indicated in the static `observedAttributes` array.
	 */
	updatedAttribute?: (
		attribute_name: string,
		attribute_old_value: string | null,
		attribute_new_value: string | null,
	) => void;

	/**
	 * Render the custom element.
	 */
	render(): HTMLElementExtension | SVGElementExtension;
}
