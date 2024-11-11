// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DropDownListProps } from "../dropdown/props";

export function filter_list(
	models: { in: string; out: string },
	list: DropDownListProps["list"],
) {
	let outinput = models.out;
	let ininput_l = models.in.toLowerCase();

	if (ininput_l.length === 0) {
		return list.map((item, idx) => ({
			...item,
			selected: outinput === item.value || outinput === item.label,
			position: idx,
		}));
	}

	return list
		.map((item, idx) => ({
			...item,
			selected: outinput === item.value || outinput === item.label,
			position: idx,
		}))
		.filter((item) => {
			return (
				item.value.toLowerCase().startsWith(ininput_l) ||
				item.label.toLowerCase().startsWith(ininput_l)
			);
		});
}
