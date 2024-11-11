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
	get_caret_contenteditable,
	set_caret_contenteditable,
} from "@phisyx/flex-helpers/contenteditable";
import { minmax } from "@phisyx/flex-helpers/minmax";

// -------- //
// Fonction //
// -------- //

export function decrement_input_counter(
	evt: Event & { shiftKey: boolean },
	input: number,
	opt: {
		disabled: boolean;
		min: number;
		max: number;
		stepX10WithShift: boolean;
		step: number;
	},
) {
	evt.preventDefault();

	if (opt.disabled) {
		return;
	}

	let stepx = opt.stepX10WithShift && evt.shiftKey ? 10 : opt.step;
	return minmax(input - stepx, opt.min, opt.max);
}

export function increment_input_counter(
	evt: Event & { shiftKey: boolean },
	input: number,
	opt: {
		disabled: boolean;
		min: number;
		max: number;
		stepX10WithShift: boolean;
		step: number;
	},
) {
	evt.preventDefault();
	if (opt.disabled) {
		return;
	}
	let stepx = opt.stepX10WithShift && evt.shiftKey ? 10 : opt.step;
	return minmax(input + stepx, opt.min, opt.max);
}

export function replace_input_counter(
	evt: Event,
	input: number,
	opt: {
		disabled: boolean;
		min: number;
		max: number;
	},
) {
	let target = evt.target as HTMLOutputElement & { value: string };
	let pos = get_caret_contenteditable(target);

	let fallback = () => {
		target.value = (Number.parseInt(input.toFixed(), 10) || 0).toFixed();

		set_caret_contenteditable(target, {
			start: pos.start,
			end: pos.end - 1,
			selected_text: pos.selected_text,
		});
	};

	if (opt.disabled) {
		fallback();
		return;
	}

	let matches = target.value.match(/[^\d]/) ?? [];

	if (matches.length > 0) {
		fallback();
		return;
	}

	let val = Number.parseInt(target.value, 10) || 0;
	let out = minmax(val, opt.min, opt.max);
	target.value = out.toFixed();
	return { value: out, pos };
}
