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
import { Some, None } from "@phisyx/flex-safety";

import { computed } from "vue";
import { ChannelNick } from "~/channel/ChannelNick";

export interface Props {
	data: object & { origin: Origin };
	id: string;
	message: string;
	isMe: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formattedTime: string;
	};
	type:
		| "action"
		| `error:${string}`
		| "event"
		| `event:${string}`
		| "privmsg";
}

export const computeIsEvent = (props: Props) =>
	computed(() => props.type.startsWith("event:"));

export const computeComponentEventName = (props: Props) =>
	computed(() => kebabcase(`room:${props.type}`));

export const computeComponentEventExists = (
	props: Props,
	eventsComponents: Array<string> = [],
) =>
	computed(() => {
		const componentName = camelCase(
			computeComponentEventName(props).value,
			{
				includes_separators: false,
			},
		);
		return eventsComponents.includes(componentName) ?? false;
	});

export const computeIsChannel = (props: Props) =>
	computed(() => props.target.startsWith("#"));

export const computeChannelNick = (props: Props) =>
	computed(() => {
		return computeIsChannel(props).value
			? Some(
					new ChannelNick(props.data.origin).withRawAccessLevel(
						// @ts-expect-error : type à corriger
						props.data.origin.access_level,
					),
			  )
			: None();
	});
