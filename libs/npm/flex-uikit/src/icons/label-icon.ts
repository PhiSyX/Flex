// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { attr, customElement } from "@phisyx/flex-custom-element";
import {
	type HTMLElementExtension as HExt,
	label,
	template_content,
	use,
} from "@phisyx/flex-html-element-extension";

@customElement({ mode: "open" })
export default class LabelIcon {
	@attr()
	get for(): string {
		return "<for-attr>";
	}

	@attr()
	get icon(): string {
		return "<icon-attr>";
	}

	render() {
		let $icon = template_content(`#icon-${this.icon}`);
		return label($icon).for(`#${this.for}`);
	}
}

export function labelIcon(
	forAttr: LabelIcon["for"],
	iconAttr: LabelIcon["icon"],
	nativeAttrs?: Partial<HTMLLabelElement>,
	...args: HExt.Args
) {
	return use(
		LabelIcon,
		{ for: forAttr, icon: iconAttr },
		nativeAttrs,
		...args,
	);
}
