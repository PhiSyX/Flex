// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { useChatStore } from "~/store/ChatStore";

import { Props } from "./ChannelRoom.state";

const chatStore = useChatStore();

// -------- //
// Handlers //
// -------- //

export function closeRoomHandler(origin: Origin) {
	chatStore.closeRoom(origin);
}

export function openPrivateHandler(origin: Origin) {
	chatStore.openPrivateOrCreate(origin);
}

export function ignoreUserHandler(origin: Origin) {
	chatStore.ignoreUser(origin.nickname);
}

export function sendMessageHandler(name: string, message: string) {
	chatStore.sendMessage(name, message);
}

export function toggleSelectedUser(props: Props) {
	function toggleSelectedUserHandler(origin: Origin) {
		chatStore.toggleSelectUser(props.room, origin);
	}
	return toggleSelectedUserHandler;
}

export function unignoreUserHandler(origin: Origin) {
	chatStore.unignoreUser(origin.nickname);
}
