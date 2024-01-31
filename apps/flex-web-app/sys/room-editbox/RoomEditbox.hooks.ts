// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ref, watchEffect } from "vue";
import { Props, inputModel } from "./RoomEditbox.state";

export function useInputHistory(props: Props, onSubmit: (props: Props) => () => void) {
	const positionArrow = ref(0);

	function keydownHandler(evt: KeyboardEvent) {
		if (!props.history) return;

		if (!["ArrowDown", "ArrowUp"].includes(evt.code)) return;

		evt.preventDefault();

		if (evt.code === "ArrowDown") {
			positionArrow.value -= 1;
		} else {
			positionArrow.value += 1;
		}

		const v = props.history[props.history.length - 1 - positionArrow.value];
		if (v == null) return;
		inputModel.value = v;
	}

	function submitHandler() {
		onSubmit(props)();
		positionArrow.value = 0;
	}

	watchEffect(() => {
		if (!props.history) return;

		if (positionArrow.value <= -1) {
			positionArrow.value = 0;
		}

		if (positionArrow.value >= props.history.length - 1) {
			positionArrow.value = props.history.length - 1;
		}
	});

	return { keydownHandler, submitHandler };
}
