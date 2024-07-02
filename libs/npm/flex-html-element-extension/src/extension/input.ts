// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Signal } from "@phisyx/flex-signal";
import { HTMLElementExtension } from "./html";

// -------------- //
// Implémentation //
// -------------- //

export class InputHTMLElementExtension extends HTMLElementExtension<HTMLInputElement> {
	static make(args: HTMLElementExtension.Args): InputHTMLElementExtension {
		return new InputHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("input"), args);
	}

	/**
	 * Public API
	 */

	form(id?: string): this {
		this.setAttribute("form", id);
		return this;
	}

	model<M extends HTMLElementExtension.Primitives>(signal: Signal<M>): this {
		signal.watch((model) => this.handleSignal(model), { immediate: true });

		this.on("input", (evt) => {
			// @ts-expect-error - We know that the input event is only triggered
			// on form elements, and that they have the property (`value` in
			// `EventTarget`) in their object.
			signal.set(evt.target.value);
		});

		return this;
	}

	name(user: string): this {
		this.setAttribute("name", user);
		return this;
	}

	value(userValue: unknown): this {
		this.setAttribute("value", String(userValue));
		return this;
	}
}
