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

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";

import { Props } from "./ChannelRoom.state";

const chatStore = useChatStore();

// -------- //
// Handlers //
// -------- //

export function closeRoomHandler(origin: Origin | string) {
	chatStore.closeRoom(origin);
}

export function openPrivateHandler(origin: Origin) {
	chatStore.openPrivateOrCreate(origin);
}

export function ignoreUserHandler(origin: Origin) {
	chatStore.ignoreUser(origin.nickname);
}

export function joinChannelHandler(name: string) {
	chatStore.joinChannel(name);
}

export function kickUser(props: Props) {
	function kickUserHandler(cnick: ChannelNick) {
		chatStore.kickUser(props.room, cnick);
	}

	return kickUserHandler;
}

export function sendMessageHandler(name: string, message: string) {
	chatStore.sendMessage(name, message);
}

export function sendSetAccessLevel(props: Props) {
	function sendSetAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		chatStore.sendSetAccessLevel(props.room, cnick, accessLevel);
	}
	return sendSetAccessLevelHandler;
}

export function sendUnsetAccessLevel(props: Props) {
	function sendUnsetAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		chatStore.sendUnsetAccessLevel(props.room, cnick, accessLevel);
	}
	return sendUnsetAccessLevelHandler;
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

export function updateTopicHandler(name: string, topic: string) {
	chatStore.updateTopic(name, topic);
}
