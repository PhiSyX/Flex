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
	use,
} from "@phisyx/flex-custom-element";
import { div, input, p } from "@phisyx/flex-html-element-extension";
import { type Signal, signal } from "@phisyx/flex-signal";
import LabelIcon from "../icons/label-icon";

@customElement({ mode: "open" })
export default class TextInput {
	declare static TAG_NAME: string;

	static props = ["model"];

	declare model: Signal<string>;

	constructor(public customElement: GlobalCustomElement) {
		this.model = signal("" as string, { watch: this.watchModelUpdate });
	}

	@attr()
	get name(): string {
		return "<name>";
	}

	@attr()
	get label(): string {
		return "<your-label-here>";
	}

	@attr()
	get type(): string {
		return "text";
	}

	render() {
		return div(
			div(
				use(LabelIcon, {
					for: this.name,
					icon: this.label,
				}),
				input()
					.extendsAttrs(this.customElement.attributes)
					.id(`#${this.name}`)
					.type(this.type)
					.model(this.model),
			).class("flex align-ji:center gap=1"),
			p().class("p:reset ml=4"),
		).class("form-group [ flex! py=1 ]");
	}

	watchModelUpdate = (newValue: string) => {
		this.customElement.emit("sync:model", newValue);
	};
}
