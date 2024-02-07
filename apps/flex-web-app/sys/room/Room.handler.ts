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
	(evtName: "change-nick-request", event: MouseEvent): void;
	(evtName: "dblclick-main", event: MouseEvent): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "send-message", message: string): void;
}

// -------- //
// Handlers //
// -------- //

export function changeNickRequest(emit: Emits) {
	function changeNickRequestHandler(event: MouseEvent) {
		emit("change-nick-request", event);
	}
	return changeNickRequestHandler;
}

export function dblclickMain(emit: Emits) {
	function dblclickMainHandler(evt: MouseEvent) {
		emit("dblclick-main", evt);
	}
	return dblclickMainHandler;
}

export function openPrivate(emit: Emits) {
	function openPrivateHandler(origin: Origin) {
		emit("open-private", origin);
	}

	return openPrivateHandler;
}

export function sendMessage(emit: Emits) {
	function sendMessageHandler(message: string) {
		emit("send-message", message);
	}

	return sendMessageHandler;
}
