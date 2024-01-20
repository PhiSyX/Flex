// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "close-room", origin: Origin): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "send-message", name: string, message: string): void;
}

// -------- //
// Handlers //
// -------- //

export function closeRoom(emit: Emits) {
	function closeRoomHandler(origin: Origin) {
		emit("close-room", origin);
	}
	return closeRoomHandler;
}

export function openPrivate(emit: Emits) {
	function openPrivateHandler(origin: Origin) {
		emit("open-private", origin);
	}
	return openPrivateHandler;
}

export function sendMessage(emit: Emits, name: string) {
	function sendMessageHandler(message: string) {
		emit("send-message", name, message);
	}
	return sendMessageHandler;
}
