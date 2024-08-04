// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_class, is_future, is_import_future } from "@phisyx/flex-asserts";
import { HTMLElementExtension as Ext } from "../extension";

// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

// @ts-expect-error à améliorer
export function use<T extends abstract new (...args: FIXME) => FIXME>(
	_import: () => Promise<{ default: T }>,
	attributes?: Partial<Omit<Attributes<T>, "customElement">>,
	...args: Ext.Args
): Promise<Ext>;

export function use<T extends abstract new (...args: FIXME) => FIXME>(
	custom_tag: T,
	attributes: Partial<Omit<Attributes<T>, "customElement">>,
	arg?: Omit<Ext.Arg, "HTMLElementExtension">,
	...args: Ext.Args
): Ext;

export function use(
	custom_tag:
		| string
		| { TAG_NAME: string }
		| Promise<{ default: FIXME }>
		| (() => Promise<{ default: FIXME }>),
	...args: Ext.Args
): Ext | Promise<Ext>
{
	let render = (custom_tag_name: string) => {
		let custom_element = Ext.create_element(
			custom_tag_name as keyof HTMLElementTagNameMap,
			args,
		);
		return custom_element;
	};

	if (is_import_future<{ default: FIXME }>(custom_tag)) {
		// biome-ignore lint/style/noParameterAssign: ;-)
		custom_tag = custom_tag();
	}

	if (is_future<{ default: FIXME }>(custom_tag)) {
		return custom_tag.then((cel) => render(cel.default.TAG_NAME));
	}

	return render(is_class(custom_tag) ? custom_tag.TAG_NAME : custom_tag);
}

export const is = use;
