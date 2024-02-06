// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Ref, nextTick } from "vue";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { Props } from "./ChannelRoom.state";

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "change-nick-request", event: MouseEvent): void;
	(evtName: "close-room", origin: Origin | string): void;
	(evtName: "ignore-user", origin: Origin): void;
	(evtName: "kick-user", cnick: ChannelNick): void;
	(evtName: "open-channel-settings", event: Event): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "select-user", origin: Origin): void;
	(evtName: "send-message", target: string, message: string): void;
	(evtName: "set-access-level", cnick: ChannelNick, accessLevel: ChannelAccessLevel): void;
	(
		evtName: "topic-mode",
		evt: Event,
		linkedElement: HTMLInputElement | undefined,
		mode: boolean,
	): void;
	(evtName: "unignore-user", origin: Origin): void;
	(evtName: "unset-access-level", cnick: ChannelNick, accessLevel: ChannelAccessLevel): void;
	(evtName: "update-topic", name: string, topic: string): void;
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

export function closeRoom(emit: Emits) {
	function closeRoomHandler(origin: Origin | string) {
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

export function kickUser(emit: Emits) {
	function kickUserHandler(cnick: ChannelNick) {
		emit("kick-user", cnick);
	}
	return kickUserHandler;
}

export function unignoreUser(emit: Emits) {
	function unignoreUserHandler(origin: Origin) {
		emit("unignore-user", origin);
	}
	return unignoreUserHandler;
}

export function openChannelSettings(emit: Emits) {
	function openChannelSettingsHandler(event: Event) {
		emit("open-channel-settings", event);
	}
	return openChannelSettingsHandler;
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

export function submitTopic(
	emit: Emits,
	props: Props,
	{
		$input,
		topicEditMode,
		topicInput,
	}: {
		$input: Ref<HTMLInputElement | undefined>;
		topicEditMode: Ref<boolean>;
		topicInput: Ref<string>;
	},
) {
	function submitTopicHandler(evt: Event) {
		topicEditMode.value = false;
		emit("topic-mode", evt, $input.value, topicEditMode.value);

		evt.preventDefault();

		if (!props.canEditTopic) {
			return;
		}

		if (topicInput.value === props.topic.get()) {
			return;
		}

		emit("update-topic", props.name, topicInput.value);
	}

	return submitTopicHandler;
}

export function enableTopicEditMode(
	props: Props,
	emit: Emits,
	{
		$topic,
		topicEditMode,
	}: {
		$topic: Ref<HTMLInputElement | undefined>;
		topicEditMode: Ref<boolean>;
	},
) {
	function enableTopicEditModeHandler(evt: Event) {
		if (!props.canEditTopic) {
			return;
		}

		topicEditMode.value = true;

		nextTick(() => {
			$topic.value?.focus();
			emit("topic-mode", evt, $topic.value, topicEditMode.value);
		});
	}
	return enableTopicEditModeHandler;
}

export function setAccessLevel(emit: Emits) {
	function setAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		emit("set-access-level", cnick, accessLevel);
	}
	return setAccessLevelHandler;
}

export function unsetAccessLevel(emit: Emits) {
	function unsetAccessLevelHandler(cnick: ChannelNick, accessLevel: ChannelAccessLevel) {
		emit("unset-access-level", cnick, accessLevel);
	}
	return unsetAccessLevelHandler;
}
