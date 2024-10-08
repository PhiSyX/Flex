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

type Heading = Ext<HTMLHeadingElement>;
export function h1(...args: Ext.Args): Heading {
	return Ext.create_element("h1", args);
}
export function h2(...args: Ext.Args): Heading {
	return Ext.create_element("h2", args);
}
export function h3(...args: Ext.Args): Heading {
	return Ext.create_element("h3", args);
}
export function h4(...args: Ext.Args): Heading {
	return Ext.create_element("h4", args);
}
export function h5(...args: Ext.Args): Heading {
	return Ext.create_element("h5", args);
}
export function h6(...args: Ext.Args): Heading {
	return Ext.create_element("h6", args);
}

export function hgroup(...args: Ext.Args): Ext {
	return Ext.create_element("hgroup", args);
}
