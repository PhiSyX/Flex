// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { camelCase, kebabcase } from "@phisyx/flex-capitalization";
import { None, Some } from "@phisyx/flex-safety";

import { computed } from "vue";
import { ChannelNick } from "~/channel/ChannelNick";
import { PrivateNick } from "~/private/PrivateNick";
import { User } from "~/user/User";

export interface Props {
	data: object & { origin: Origin | ChannelOrigin };
	archived: boolean;
	id: string;
	message: string;
	isMe: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formattedTime: string;
	};
	type: "action" | `error:${string}` | "event" | `event:${string}` | "pubmsg" | "privmsg";
}

export const computeIsEvent = (props: Props) => computed(() => props.type.startsWith("event:"));

export const computeIsExternalMessage = (props: Props) =>
	computed(() => {
		if (props.type === "pubmsg") {
			const data = props.data as GenericReply<"PUBMSG">;
			if (data.external) return Some(data.origin);
		}
		return None();
	});

export const computeComponentEventName = (props: Props) =>
	computed(() => kebabcase(`room:${props.type}`));

export const computeComponentEventExists = (props: Props, eventsComponents: Array<string> = []) =>
	computed(() => {
		const componentName = camelCase(computeComponentEventName(props).value, {
			includes_separators: false,
		});
		return eventsComponents.includes(componentName) ?? false;
	});

export const computeIsChannel = (props: Props) =>
	computed(() => props.nickname !== "*" && props.target.startsWith("#"));

export const computeIsPrivate = (props: Props) =>
	computed(() => props.nickname !== "*" && !computeIsChannel(props).value);

export const computeChannelNick = (props: Props) =>
	computed(() => {
		const cnick = new ChannelNick(new User(props.data.origin));
		if ("access_level" in props.data.origin) {
			cnick.withRawAccessLevel(props.data.origin.access_level);
		}
		return computeIsChannel(props).value ? Some(cnick) : None();
	});

export const computePrivateNick = (props: Props) =>
	computed(() => {
		return computeIsPrivate(props).value
			? Some(new PrivateNick(new User(props.data.origin)).withIsMe(props.isMe))
			: None();
	});
