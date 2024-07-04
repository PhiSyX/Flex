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
	type GlobalCustomElement,
	attr,
	customElement,
} from "@phisyx/flex-custom-element";
import { button, templateContent } from "@phisyx/flex-html-element-extension";

import scss from "./button-icon.scss?url";

@customElement({ mode: "open", styles: [scss] })
export default class ButtonIcon {
	constructor(public customElement: GlobalCustomElement) {}

	@attr({ parser: Boolean })
	get disabled(): boolean {
		return false;
	}

	@attr()
	get icon(): string {
		return "<icon-attr>";
	}

	render() {
		const $icon = templateContent(`#icon-${this.icon}`);
		return button($icon)
			.extendsAttrs(this.customElement.attributes)
			.class("btn flex:shrink=0")
			.type("button");
	}
}
