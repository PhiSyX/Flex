// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { HTMLElementExtension as Ext, SlotHTMLElementExtension } from "../extension";

export function abbr(...args: Ext.Args) {
	return Ext.createElement("abbr", args);
}

export function br(...args: Ext.Args): Ext<HTMLBRElement> {
	return Ext.createElement("br", args);
}

export function cite(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createElement("cite", args);
}

export function code(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createElement("code", args);
}

export function em(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createElement("em", args);
}

export function kbd(...args: Ext.Args) {
	return Ext.createElement("kbd", args);
}

export function p(...args: Ext.Args): Ext<HTMLParagraphElement> {
	return Ext.createElement("p", args);
}

export function ruby(...args: Ext.Args) {
	return Ext.createElement("ruby", args);
}

export function q(...args: Ext.Args): Ext<HTMLQuoteElement> {
	return Ext.createElement("q", args);
}

export function slot(...args: Ext.Args): SlotHTMLElementExtension {
	return SlotHTMLElementExtension.make(args);
}

export function span(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createElement("span", args);
}

export function strong(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createElement("strong", args);
}

export function time(...args: Ext.Args): Ext<HTMLTimeElement> {
	return Ext.createElement("time", args);
}
