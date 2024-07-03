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
	HTMLElementExtension as Ext,
	FormHTMLElementExtension,
	InputHTMLElementExtension,
	LabelHTMLElementExtension,
} from "../extension";

export function fieldset(...args: Ext.Args): Ext<HTMLFieldSetElement> {
	return Ext.createElement("fieldset", args);
}

export function label(...args: Ext.Args): LabelHTMLElementExtension {
	return LabelHTMLElementExtension.make(args);
}

export function form(...args: Ext.Args): FormHTMLElementExtension {
	return FormHTMLElementExtension.make(args);
}

export function input(...args: Ext.Args): InputHTMLElementExtension {
	return InputHTMLElementExtension.make(args);
}

export function output(...args: Ext.Args): Ext<HTMLOutputElement> {
	return Ext.createElement("output", args);
}

export function progress(...args: Ext.Args): Ext<HTMLProgressElement> {
	return Ext.createElement("progress", args);
}

export function textarea(...args: Ext.Args): Ext<HTMLTextAreaElement> {
	return Ext.createElement("textarea", args);
}
