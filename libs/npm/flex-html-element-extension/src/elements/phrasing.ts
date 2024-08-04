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
	SlotHTMLElementExtension,
} from "../extension";

export function abbr(...args: Ext.Args): Ext
{
	return Ext.create_element("abbr", args);
}

export function br(...args: Ext.Args): Ext<HTMLBRElement>
{
	return Ext.create_element("br", args);
}

export function cite(...args: Ext.Args): Ext<HTMLSpanElement>
{
	return Ext.create_element("cite", args);
}

export function code(...args: Ext.Args): Ext<HTMLSpanElement>
{
	return Ext.create_element("code", args);
}

export function em(...args: Ext.Args): Ext<HTMLSpanElement>
{
	return Ext.create_element("em", args);
}

export function kbd(...args: Ext.Args)
{
	return Ext.create_element("kbd", args);
}

export function p(...args: Ext.Args): Ext<HTMLParagraphElement>
{
	return Ext.create_element("p", args);
}

export function ruby(...args: Ext.Args)
{
	return Ext.create_element("ruby", args);
}

export function q(...args: Ext.Args): Ext<HTMLQuoteElement>
{
	return Ext.create_element("q", args);
}

export function slot(...args: Ext.Args): SlotHTMLElementExtension
{
	return SlotHTMLElementExtension.make(args);
}

export function span(...args: Ext.Args): Ext<HTMLSpanElement>
{
	return Ext.create_element("span", args);
}

export function strong(...args: Ext.Args): Ext<HTMLSpanElement>
{
	return Ext.create_element("strong", args);
}

export function time(...args: Ext.Args): Ext<HTMLTimeElement>
{
	return Ext.create_element("time", args);
}
