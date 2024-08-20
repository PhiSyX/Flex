// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Directive, VNode } from "vue";

import { is_object } from "@phisyx/flex-asserts";

import { nextTick, warn } from "vue";

const assign_key: symbol = Symbol("_assign");

type DirectiveModelObject = Directive<
	HTMLSelectElement & {
		_assigning: boolean;
		[o: symbol]: (value: unknown) => void;
	},
	Record<string, boolean>
>;

/// Directive `v-model`.
const model_object_select: DirectiveModelObject = {
	deep: true,

	created(el, binding, vnode) {
		el.addEventListener("change", () => {
			const selected_object = Array.from(el.options).reduce(
				(acc: Record<string, boolean>, opt) => {
					acc[get_value(opt)] = opt.selected;
					return acc;
				},
				binding.value,
			);
			el[assign_key](selected_object);
			el._assigning = true;
			nextTick(() => {
				el._assigning = false;
			});
		});
		el[assign_key] = get_model_assigner(vnode);
	},

	mounted(el, binding) {
		set_selected(el, binding.value);
	},

	beforeUpdate(el, _binding, vnode) {
		el[assign_key] = get_model_assigner(vnode);
	},
	updated(el, binding) {
		if (!el._assigning) {
			set_selected(el, binding.value);
		}
	},
};

function get_value(el: HTMLOptionElement): string 
{
	return Object.hasOwn(el, "_value") ? (el._value as string) : el.value;
}

function set_selected(el: HTMLSelectElement, value: { [o: string]: boolean })
{
	if (el.multiple && !is_object(value)) {
		warn(
			"<select multiple v-model> expects an Object value for its ",
			"binding, but got ",
			Object.prototype.toString.call(value).slice(8, -1),
			".",
		);
		return;
	}

	for (let i = 0, l = el.options.length; i < l; i++) {
		let option = el.options[i];
		let option_value = get_value(option);
		option.selected = value[option_value];
	}
}

function get_model_assigner(vnode: VNode)
{
	return (value: unknown) => vnode.props?.["onUpdate:modelValue"]?.(value);
}

export default model_object_select;
