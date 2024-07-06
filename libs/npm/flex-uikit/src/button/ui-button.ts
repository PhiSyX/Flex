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
	button,
	fragment,
	slot,
	templateContent,
	use,
} from "@phisyx/flex-html-element-extension";

import { signal } from "@phisyx/flex-signal";
import scss from "./ui-button.scss?url";

@customElement({ mode: "open", styles: [scss] })
export default class UiButton {
	declare static TAG_NAME: string;

	static props = ["selected"];
	selected = signal(undefined as unknown);

	constructor(public customElement: GlobalCustomElement) {}

	@attr()
	get icon(): { toString(): string } | undefined {
		return undefined;
	}

	@attr()
	get position(): "left" | "right" {
		return "left";
	}

	@attr()
	get withOpacity(): boolean | undefined {
		return true;
	}

	@attr()
	get value(): unknown {
		return undefined;
	}

	@attr()
	get trueValue(): unknown {
		return undefined;
	}

	@attr()
	get falseValue(): unknown {
		return undefined;
	}

	@attr()
	get type(): HTMLButtonElement["type"] | "dialog" | undefined {
		return "button";
	}

	@attr()
	get variant(): "primary" | "secondary" | "danger" | undefined {
		return undefined;
	}

	get value$() {
		return this.value ?? this.trueValue;
	}

	get isSelected() {
		return this.value$ == null && this.selected == null
			? false
			: this.value$ === this.selected;
	}

	render() {
		return button(
			fragment(() => templateContent(`#icon-${this.icon}`)) //
				.onlyIf(this.icon != null && this.position === "left"),
			slot,
			fragment(() => templateContent(`#icon-${this.icon}`)) //
				.onlyIf(this.icon != null && this.position === "right"),
		)
			.extendsAttrs(this.customElement.attributes)
			.class("btn flex:shrink=0")
			.class({
				"btn(:active)": this.isSelected,
				"btn/without-opacity": this.withOpacity === false,
				[`btn/${this.variant}`]: this.variant,
			})
			.type(this.type)
			.onClick(this.handleClickHandler);
	}

	handleClickHandler = (_: MouseEvent) => {
		if (this.value == null && this.selected == null) {
			return;
		}

		if (this.isSelected) {
			if (this.falseValue != null) {
				this.selected.set(this.falseValue);
			} else {
				this.selected.set(this.value$);
			}
		} else {
			if (this.trueValue != null) {
				this.selected.set(this.trueValue);
			} else if (this.falseValue != null) {
				this.selected.set(this.falseValue);
			} else {
				this.selected.set(this.value$);
			}
		}
	};
}

export function uiButton(
	attrs: Attributes<typeof UiButton>,
	nativeAttrs?: Partial<HTMLButtonElement>,
	...args: HExt.Args
) {
	return use(UiButton, attrs, nativeAttrs, ...args);
}
