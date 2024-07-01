// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { HTMLElementExtension as Ext } from "../extension";

export const fieldset = (...args: Ext.Args): Ext<HTMLFieldSetElement> =>
	Ext.createHTMLElement("fieldset", args);

export const label = (...args: Ext.Args): Ext<HTMLLabelElement> =>
	Ext.createHTMLElement("label", args);

export const form = (...args: Ext.Args): Ext<HTMLFormElement> =>
	Ext.createHTMLElement("form", args);

export const input = (...args: Ext.Args): Ext<HTMLInputElement> =>
	Ext.createHTMLElement("input", args);

export const output = (...args: Ext.Args): Ext<HTMLOutputElement> =>
	Ext.createHTMLElement("output", args);

export const progress = (...args: Ext.Args): Ext<HTMLProgressElement> =>
	Ext.createHTMLElement("progress", args);

export const textarea = (...args: Ext.Args): Ext<HTMLTextAreaElement> =>
	Ext.createHTMLElement("textarea", args);
