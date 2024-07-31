// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RoomMessage } from "../room/message";
import type { ChannelMember } from "./member";
import type { ChannelRoom } from "./room";

// ---- //
// Type //
// ---- //

type ChannelActivityGroupName = "notice";

export interface ChannelActivitiesView {
	groups: Array<ChannelActivityGroup>;
}

export interface ChannelActivity {
	channel: ChannelRoom;
	member: ChannelMember;
	message: RoomMessage<ChannelID, { text: string }>;
}
export interface ChannelActivityRef {
	channelID: ChannelID;
	nickname: string;
	messageID: RoomMessage["id"];
}

export interface ChannelActivityGroup {
	name: ChannelActivityGroupName;
	createdAt: string;
	activities: Array<ChannelActivity>;
}
export interface ChannelActivityGroupRef {
	createdAt: Date;
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
			nickname: string;
			messageID: RoomMessage["id"];
		},
	) {
		const newActivity: ChannelActivityRef = {
			channelID: payload.channelID,
			nickname: payload.nickname,
			messageID: payload.messageID,
		};

		let [lastGroup, lastChannelActivities] = this.groups.at(-1) || [];
		if (lastGroup === group) {
			lastChannelActivities?.activities.push(newActivity);
		} else {
			this.groups.push([
				group,
				{
					createdAt: new Date(),
					activities: [newActivity],
				},
			]);
		}
	}
}
