// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

export function change_selected(
	selects: { selected: unknown; is_selected: boolean },
	values: { value: unknown; falseValue: unknown; trueValue: unknown },
): unknown {
	if (values.value == null && selects.selected == null) {
		return;
	}

	if (selects.is_selected) {
		if (values.falseValue != null) {
			return values.falseValue;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			return values.value;
		}
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		if (values.trueValue != null) {
			return values.trueValue;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else if (values.falseValue != null) {
			return values.falseValue;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			return values.value;
		}
	}
}
