// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { isClass } from "@phisyx/flex-asserts";
import { HTMLElementExtension as Ext } from "../extension";

// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

type FlagExcludedType<B, T> = {
	[Key in keyof B]: B[Key] extends T ? never : Key;
};
type AllowedNames<B, T> = FlagExcludedType<B, T>[keyof B];
type OmitType<B, T> = Pick<B, AllowedNames<B, T>>;
type Attributes<T extends abstract new (...args: FIXME) => FIXME> = OmitType<
	InstanceType<T>,
	// biome-ignore lint/complexity/noBannedTypes: ;-)
	Function
>;

// @ts-expect-error à améliorer
export function use<T extends abstract new (...args: FIXME) => FIXME>(
	customTag: T,
	attributes: Partial<Omit<Attributes<T>, "customElement">>,
	arg?: Omit<Ext.Arg, "HTMLElementExtension">,
): Ext;
export function use(
	customTag: string | { TAG_NAME: string },
	...args: Ext.Args
): Ext {
	const customTagName = isClass(customTag) ? customTag.TAG_NAME : customTag;
	const customElement = Ext.createHTMLElement(
		customTagName as keyof HTMLElementTagNameMap,
		args,
	);
	return customElement;
}

export const is = use;
