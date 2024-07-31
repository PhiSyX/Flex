// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option } from "@phisyx/flex-safety";
import type { RoomMessage } from "../room/message";
import type { ChannelMember } from "./member";
import type { ChannelRoom } from "./room";

// ---- //
// Type //
// ---- //

type ChannelActivityGroupName = "mention" | "notice";

export interface ChannelActivitiesView {
	groups: Array<ChannelActivityGroup>;
}

export interface ChannelActivity {
	channel: ChannelRoom;
	member: ChannelMember;
	message: RoomMessage<ChannelID, { text: string }>;
	previousMessages: Array<ChannelActivity>;
}
export interface ChannelActivityRef {
	channelID: ChannelID;
	nickname: string;
	messageID: RoomMessage["id"];
	previousMessageIDs: Array<RoomMessage["id"]>;
}

export interface ChannelActivityGroup {
	name: ChannelActivityGroupName;
	createdAt: string;
	updatedAt: Option<string>;
	activities: Array<ChannelActivity>;
}
export interface ChannelActivityGroupRef {
	createdAt: Date;
	updatedAt: Option<Date>;
	activities: Array<ChannelActivityRef>;
}

export type TupleActivities = [
	name: ChannelActivityGroupName,
	groups: ChannelActivityGroup,
];
export type TupleActivitiesRef = [
	name: ChannelActivityGroupName,
	groups: ChannelActivityGroupRef,
];

// -------------- //
// Implémentation //
// -------------- //

export class ChannelActivities {
	public groups: Array<TupleActivitiesRef> = [];

	append(
		group: ChannelActivityGroupName,
		payload: {
			channelID: ChannelID;
			previousMessageIDs?: Array<RoomMessage["id"]>;
			nickname: string;
			messageID: RoomMessage["id"];
		},
	) {
		const newActivity: ChannelActivityRef = {
			channelID: payload.channelID,
			nickname: payload.nickname,
			messageID: payload.messageID,
			previousMessageIDs: payload.previousMessageIDs || [],
		};

		let [lastGroup, lastChannelActivities] = this.groups.at(-1) || [];
		if (lastGroup === group && lastChannelActivities) {
			const newDate = new Date();
			lastChannelActivities.updatedAt.replace(newDate);
			lastChannelActivities.activities.push(newActivity);
		} else {
			const newDate = new Date();
			this.groups.push([
				group,
				{
					createdAt: newDate,
					updatedAt: None(),
					activities: [newActivity],
				},
			]);
		}
	}
}
