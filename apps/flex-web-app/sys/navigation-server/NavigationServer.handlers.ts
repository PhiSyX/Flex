// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ModelRef } from "vue";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "change-room", origin: Origin | string): void;
	(evtName: "close-room", origin: Origin | string): void;
}

// -------- //
// Handlers //
// -------- //

export function changeRoom(emit: Emits, origin: Origin | string) {
	function onEventHandler(evt: Event) {
		evt.preventDefault();
		evt.stopPropagation();
		openRoom(emit)(origin);
	}

	return onEventHandler;
}

export function openRoom(emit: Emits) {
	function openRoomHandler(origin: Origin | string) {
		emit("change-room", origin);
	}

	return openRoomHandler;
}

export function closeRoom(emit: Emits) {
	function closeRoomHandler(origin: Origin | string) {
		emit("close-room", origin);
	}

	return closeRoomHandler;
}

export function toggleFold(foldedModel: ModelRef<boolean | undefined, string>) {
	function toggleFoldHandler() {
		foldedModel.value = !foldedModel.value;
	}

	return toggleFoldHandler;
}
