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
	(evtName: "ignore-user", origin: Origin): void;
	(evtName: "unignore-user", origin: Origin): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "select-user", origin: Origin): void;
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

export function ignoreUser(emit: Emits) {
	function ignoreUserHandler(origin: Origin) {
		emit("ignore-user", origin);
	}
	return ignoreUserHandler;
}

export function unignoreUser(emit: Emits) {
	function unignoreUserHandler(origin: Origin) {
		emit("unignore-user", origin);
	}
	return unignoreUserHandler;
}

export function openPrivate(emit: Emits) {
	function openPrivateHandler(origin: Origin) {
		emit("open-private", origin);
	}
	return openPrivateHandler;
}

export function selectUser(emit: Emits) {
	function selectUserHandler(origin: Origin) {
		emit("select-user", origin);
	}
	return selectUserHandler;
}

export function sendMessage(emit: Emits, name: string) {
	function sendMessageHandler(message: string) {
		emit("send-message", name, message);
	}
	return sendMessageHandler;
}
