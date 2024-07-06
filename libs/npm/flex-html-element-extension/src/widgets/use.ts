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
	isClass,
	isFunction,
	isFuture,
	isImportFuture,
} from "@phisyx/flex-asserts";
import { HTMLElementExtension as Ext } from "../extension";

// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

export function use(
	_import: () => Promise<{ default: FIXME }>,
	...args: Ext.Args
): Promise<Ext>;

// @ts-expect-error à améliorer
export function use<T extends abstract new (...args: FIXME) => FIXME>(
	customTag: T,
	attributes: Partial<Omit<Attributes<T>, "customElement">>,
	arg?: Omit<Ext.Arg, "HTMLElementExtension">,
	...args: Ext.Args
): Ext;

export function use(
	customTag:
		| string
		| { TAG_NAME: string }
		| Promise<{ default: FIXME }>
		| (() => Promise<{ default: FIXME }>),
	...args: Ext.Args
): Ext | Promise<Ext> {
	let render = (customTagName: string) => {
		const customElement = Ext.createElement(
			customTagName as keyof HTMLElementTagNameMap,
			args,
		);
		return customElement;
	};

	if (isImportFuture<{ default: FIXME }>(customTag)) {
		// biome-ignore lint/style/noParameterAssign: ;-)
		customTag = customTag();
	}

	if (isFuture<{ default: FIXME }>(customTag)) {
		return customTag.then((cel) => render(cel.default.TAG_NAME));
	}

	return render(isClass(customTag) ? customTag.TAG_NAME : customTag);
}

export const is = use;
