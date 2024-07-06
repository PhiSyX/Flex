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
import {
	type HTMLElementExtension as HExt,
	div,
	input,
	p,
	use,
} from "@phisyx/flex-html-element-extension";
import { type Signal, signal } from "@phisyx/flex-signal";
import LabelIcon, { labelIcon } from "../icons/label-icon";

import scss from "./text-input.scss?url";

@customElement({ mode: "open", styles: [scss] })
export default class TextInput {
	declare static TAG_NAME: string;

	static props = ["model"];

	declare model: Signal<HExt.Primitives>;

	constructor(public customElement: GlobalCustomElement) {
		this.model = signal("" as HExt.Primitives, {
			watch: this.watchModelUpdate,
		});
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
				labelIcon(this.name, this.label),
				input(this.model)
					.extendsAttrs(this.customElement.attributes)
					.id(`#${this.name}`)
					.type(this.type),
			).class("flex align-ji:center gap=1"),
			p().class("p:reset ml=4"),
		).class("form-group [ flex! py=1 ]");
	}

	watchModelUpdate = (newValue: HExt.Primitives) => {
		this.customElement.emit("sync:model", newValue);
	};
}

export function textInput<P extends HExt.Primitives>(
	model: Signal<P>,
	attrs: Attributes<typeof TextInput>,
	nativeAttrs?: Partial<HTMLInputElement>,
	...args: HExt.Args
) {
	return use(
		TextInput,
		{
			...attrs,
			// @ts-expect-error Signal<HExt.Primitives>
			model,
		},
		nativeAttrs,
		...args,
	);
}
