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

export const fieldset = (...args: Ext.Args): Ext<HTMLFieldSetElement> =>
	Ext.createElement("fieldset", args);

export const label = (...args: Ext.Args): LabelHTMLElementExtension =>
	LabelHTMLElementExtension.make(args);

export const form = (...args: Ext.Args): FormHTMLElementExtension =>
	FormHTMLElementExtension.make(args);

export const input = (...args: Ext.Args): InputHTMLElementExtension =>
	InputHTMLElementExtension.make(args);

export const output = (...args: Ext.Args): Ext<HTMLOutputElement> =>
	Ext.createElement("output", args);

export const progress = (...args: Ext.Args): Ext<HTMLProgressElement> =>
	Ext.createElement("progress", args);

export const textarea = (...args: Ext.Args): Ext<HTMLTextAreaElement> =>
	Ext.createElement("textarea", args);
