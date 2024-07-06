// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { isPrimitive } from "@phisyx/flex-asserts";
import { type Signal, isSignal } from "@phisyx/flex-signal";
import {
	FormHTMLElementExtension,
	HTMLElementExtension as HExt,
	InputHTMLElementExtension,
	LabelHTMLElementExtension,
} from "../extension";

export function fieldset(...args: HExt.Args): HExt<HTMLFieldSetElement> {
	return HExt.createElement("fieldset", args);
}

export function label(...args: HExt.Args): LabelHTMLElementExtension {
	return LabelHTMLElementExtension.make(args);
}

export function form(...args: HExt.Args): FormHTMLElementExtension {
	return FormHTMLElementExtension.make(args);
}

export function input<P extends HExt.Primitives>(
	model: Signal<P> | P,
	...args: HExt.Args
): InputHTMLElementExtension {
	let $input = InputHTMLElementExtension.make(args);
	if (isSignal<P>(model)) {
		$input = $input.model(model);
	} else {
		$input = $input.value(model);
	}
	return $input;
}

export function output(...args: HExt.Args): HExt<HTMLOutputElement> {
	return HExt.createElement("output", args);
}

export function progress(...args: HExt.Args): HExt<HTMLProgressElement> {
	return HExt.createElement("progress", args);
}

export function textarea(...args: HExt.Args): HExt<HTMLTextAreaElement> {
	return HExt.createElement("textarea", args);
}
