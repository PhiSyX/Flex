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
	AnimateTransformSVGElementExtension,
	CircleSVGElementExtension,
	SVGElementExtension as Ext,
} from "../extension";

export function svg(
	size: [w: number, h: number],
	...args: Ext.Args
): Ext<SVGSVGElement> {
	return Ext.createElement("svg", args)
		.width(size[0])
		.height(size[1])
		.viewBox(`0 0 ${size[0]} ${size[1]}`);
}

export function path(d: string, ...args: Ext.Args): Ext<SVGPathElement> {
	return Ext.createElement("path", args).d(d).fill("currentColor");
}

export function circle(
	cx: number,
	cy: number,
	r: number,
	...args: Ext.Args
): CircleSVGElementExtension {
	return CircleSVGElementExtension.make(args).cx(cx).cy(cy).r(r);
}

export function animateTransform(
	attributeName: string,
	...args: Ext.Args
): AnimateTransformSVGElementExtension {
	return AnimateTransformSVGElementExtension.make(args).attributeName(
		attributeName,
	);
}
