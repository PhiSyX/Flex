// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ModelRef } from "vue";
import { type Props, computeIsSelected, computeValue$ } from "./Button.state";

export function handleClick(props: Props, selectedModel: ModelRef<unknown, string>) {
	function handleClickHandler(_: MouseEvent) {
		if (computeValue$(props).value == null && props.selected == null) {
			return;
		}

		if (computeIsSelected(props).value) {
			if (props.falseValue != null) {
				selectedModel.value = props.falseValue;
			} else {
				selectedModel.value = computeValue$(props).value;
			}
		} else {
			if (props.trueValue != null) {
				selectedModel.value = props.trueValue;
			} else if (props.falseValue != null) {
				selectedModel.value = props.falseValue;
			} else {
				selectedModel.value = computeValue$(props).value;
			}
		}
	}

	return handleClickHandler;
}
