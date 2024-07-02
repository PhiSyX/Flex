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

export function article(...args: Ext.Args) {
	return Ext.createElement("article", args);
}

export function aside(...args: Ext.Args) {
	return Ext.createElement("aside", args);
}

type Dialog = Ext<HTMLDialogElement>;
export function dialog(...a: Ext.Args): Dialog {
	return Ext.createElement("dialog", a);
}

type Div = Ext<HTMLDivElement>;
export function div(...args: Ext.Args): Div {
	return Ext.createElement("div", args);
}

export function figure(...args: Ext.Args) {
	return Ext.createElement("figure", args);
}

export function footer(...args: Ext.Args) {
	return Ext.createElement("footer", args);
}

export function header(...args: Ext.Args) {
	return Ext.createElement("header", args);
}

type Hr = Ext<HTMLHRElement>;
export function hr(...args: Ext.Args): Hr {
	return Ext.createElement("hr", args);
}

export function main(...args: Ext.Args) {
	return Ext.createElement("main", args);
}

type Menu = Ext<HTMLMenuElement>;
export function menu(...args: Ext.Args): Menu {
	return Ext.createElement("menu", args);
}

export function nav(...args: Ext.Args) {
	return Ext.createElement("nav", args);
}

type Pre = Ext<HTMLPreElement>;
export function pre(...args: Ext.Args): Pre {
	return Ext.createElement("pre", args);
}

export function search(...args: Ext.Args) {
	return Ext.createElement("search", args);
}

export function section(...args: Ext.Args) {
	return Ext.createElement("section", args);
}
