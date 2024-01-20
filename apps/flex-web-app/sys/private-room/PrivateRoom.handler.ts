// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Props } from "./PrivateRoom.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "close-room", name: string): void;
	(evtName: "send-message", name: string, message: string): void;
	(evtName: "ignore-user", nickname: string): void;
	(evtName: "unignore-user", nickname: string): void;
}

// -------- //
// Handlers //
// -------- //

export function closeRoom(emit: Emits) {
	function closeRoomHandler(name: string) {
		emit("close-room", name);
	}
	return closeRoomHandler;
}

export function sendMessage(emit: Emits, name: string) {
	function sendMessageHandler(message: string) {
		emit("send-message", name, message);
	}
	return sendMessageHandler;
}

export function toggleIgnoreUser(emit: Emits, props: Props) {
	function toggleIgnoreUserHandler() {
		if (props.disableInput) {
			emit("unignore-user", props.recipient.nickname);
		} else {
			emit("ignore-user", props.recipient.nickname);
		}
	}
	return toggleIgnoreUserHandler;
}
