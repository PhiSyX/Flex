// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Props, inputModel } from "./RoomEditbox.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "change-nick-request", event: MouseEvent): void;
	(evtName: "submit", inputModel: string): void;
}

// -------- //
// Handlers //
// -------- //

export const onSubmit = (emit: Emits) => (props: Props) => {
	function onSubmitHandler() {
		if (props.disableInput || inputModel.value.length === 0) {
			return;
		}
		emit("submit", inputModel.value);
		inputModel.value = "";
	}

	return onSubmitHandler;
};

export function changeNick(emit: Emits) {
	function changeNickHandler(event: MouseEvent) {
		emit("change-nick-request", event);
	}
	return changeNickHandler;
}
