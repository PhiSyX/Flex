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
	label,
	li,
	ol,
	slot,
	use,
} from "@phisyx/flex-html-element-extension";
import { type Signal, signal } from "@phisyx/flex-signal";

import scss from "./input-switch.scss?url";

enum InputRadioLabelDefault {
	Yes = "Yes",
	No = "No",
}

@customElement({ mode: "open", styles: [scss] })
export default class InputSwitch {
	declare static TAG_NAME: string;

	static props = ["model"];

	declare model: Signal<boolean>;

	constructor(public customElement: GlobalCustomElement) {
		this.model = signal(false as boolean, {
			watch: this.watchModelUpdate,
			parser: Boolean,
		});
	}

	@attr()
	get form(): string | undefined {
		return undefined;
	}

	@attr()
	get name(): string {
		return "<name>";
	}

	@attr()
	get labelN(): string {
		return InputRadioLabelDefault.No;
	}

	@attr()
	get valueN(): string | boolean {
		return false;
	}

	@attr()
	get labelY(): string {
		return InputRadioLabelDefault.Yes;
	}

	@attr()
	get valueY(): string | boolean {
		return true;
	}

	render() {
		const uniqueID = this.name;
		const inputAttrID = `radio_${uniqueID}`;
		const inputAttrIDYes = `${inputAttrID}_y`;
		const inputAttrIDNo = `${inputAttrID}_n`;
		return div(
			slot,
			ol(
				li(
					input(this.model)
						.id(`#${inputAttrIDYes}`)
						.form(this.form)
						.name(this.name)
						.value(this.valueY)
						.type("radio"),
					label(this.labelY).for(`#${inputAttrIDYes}`),
				),
				li(
					input(this.model)
						.id(`#${inputAttrIDNo}`)
						.form(this.form)
						.name(this.name)
						.value(this.valueN)
						.type("radio"),
					label(this.labelN).for(`#${inputAttrIDNo}`),
					div({
						// @ts-expect-error à corriger
						"aria-hidden": true,
					}).class("marker"),
				),
			),
		).class("input@radio/switch");
	}

	watchModelUpdate = (newValue: boolean) => {
		this.customElement.emit("sync:model", newValue);
	};
}

export function inputSwitch<P extends HExt.Primitives>(
	model: Signal<P> | P,
	attrs: Attributes<typeof InputSwitch>,
	nativeAttrs?: Partial<HTMLInputElement>,
	...args: HExt.Args
) {
	let $attrs: Attributes<typeof InputSwitch> = {
		...attrs,
		// @ts-expect-error à corriger
		model,
	};
	return use(InputSwitch, $attrs, nativeAttrs, ...args);
}
