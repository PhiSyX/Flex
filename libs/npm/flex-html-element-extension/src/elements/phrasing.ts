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

export function abbr(...args: Ext.Args) {
	return Ext.createHTMLElement("abbr", args);
}

export function br(...args: Ext.Args): Ext<HTMLBRElement> {
	return Ext.createHTMLElement("br", args);
}

export function cite(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createHTMLElement("cite", args);
}

export function code(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createHTMLElement("code", args);
}

export function em(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createHTMLElement("em", args);
}

export function kbd(...args: Ext.Args) {
	return Ext.createHTMLElement("kbd", args);
}

export function p(...args: Ext.Args): Ext<HTMLParagraphElement> {
	return Ext.createHTMLElement("p", args);
}

export function ruby(...args: Ext.Args) {
	return Ext.createHTMLElement("ruby", args);
}

export function q(...args: Ext.Args): Ext<HTMLQuoteElement> {
	return Ext.createHTMLElement("q", args);
}

export function slot(...args: Ext.Args): Ext<HTMLSlotElement> {
	return Ext.createHTMLElement("slot", args);
}

export function span(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createHTMLElement("span", args);
}

export function strong(...args: Ext.Args): Ext<HTMLSpanElement> {
	return Ext.createHTMLElement("strong", args);
}

export function time(...args: Ext.Args): Ext<HTMLTimeElement> {
	return Ext.createHTMLElement("time", args);
}
