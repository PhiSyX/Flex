// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Props } from "./RoomEditbox.state";

import { input_model } from "./RoomEditbox.state";

// ---- //
// Type //
// ---- //

export interface Emits
{
	(event_name: "change-nickname", event: MouseEvent): void;
	(event_name: "submit", model: string): void;
}

// -------- //
// Handlers //
// -------- //

export const on_submit = (emit: Emits, props: Props) =>
{
	function submit_handler()
	{
		if (props.disableInput || input_model.value.length === 0) {
			return;
		}
		emit("submit", input_model.value);
		input_model.value = "";
	}

	return submit_handler;
};

export function change_nick(emit: Emits)
{
	return (event: MouseEvent) => emit("change-nickname", event);
}
