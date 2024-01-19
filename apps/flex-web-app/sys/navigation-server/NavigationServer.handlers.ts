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
	(evtName: "change-room", name: string): void;
	(evtName: "close-room", name: string): void;
}

// -------- //
// Handlers //
// -------- //

export function changeRoom(emit: Emits, name: string) {
	function onEventHandler(evt: Event) {
		evt.preventDefault();
		evt.stopPropagation();
		openRoom(emit)(name);
	}

	return onEventHandler;
}

export function openRoom(emit: Emits) {
	function openRoomHandler(name: string) {
		emit("change-room", name);
	}

	return openRoomHandler;
}

export function closeRoom(emit: Emits) {
	function closeRoomHandler(name: string) {
		emit("close-room", name);
	}

	return closeRoomHandler;
}

export function toggleFold(foldedModel: ModelRef<boolean | undefined, string>) {
	function toggleFoldHandler() {
		foldedModel.value = !foldedModel.value;
	}

	return toggleFoldHandler;
}
