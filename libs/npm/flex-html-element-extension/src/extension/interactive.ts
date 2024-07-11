// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { HTMLElementExtension } from "./html";

// ---- //
// Type //
// ---- //

type ButtonType = HTMLButtonElement["type"] | "dialog";

// -------------- //
// Implémentation //
// -------------- //

export class AnchorHTMLElementExtension extends HTMLElementExtension<HTMLAnchorElement> {
	static make(args: HTMLElementExtension.Args): AnchorHTMLElementExtension {
		return new AnchorHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("a"), args);
	}

	/**
	 * Public API
	 */

	href(value: HTMLAnchorElement["href"]): this {
		return this.setAttribute("href", value);
	}
}

export class ButtonHTMLElementExtension extends HTMLElementExtension<HTMLButtonElement> {
	static make(args: HTMLElementExtension.Args): ButtonHTMLElementExtension {
		return new ButtonHTMLElementExtension(args);
	}

	constructor(args: HTMLElementExtension.Args) {
		super(document.createElement("button"), args);
	}

	/**
	 * Public API
	 */

	override type(ty?: ButtonType & {}): this {
		return super.type(ty);
	}
}
