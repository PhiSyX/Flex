// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";
import type { RoomMessage } from "../room/message";
import type { User } from "../user";
import type { ChannelMember } from "./member";
import type { ChannelRoom } from "./room";

import { None } from "@phisyx/flex-safety";

// ---- //
// Type //
// ---- //

type ChannelActivityGroupName = "mention" | "notice";

export interface ChannelActivitiesView
{
	groups: Array<ChannelActivityGroup>;
}

export interface ChannelActivity
{
	channel: ChannelRoom;
	member: Option<ChannelMember | User>;
	message: RoomMessage<ChannelID,
	{ text: string }>;
	previousMessages: Array<ChannelActivity>;
}
export interface ChannelActivityRef
{
	channel_id: ChannelID;
	nickname: string;
	message_id: RoomMessage["id"];
	previous_messages_ids: Array<RoomMessage["id"]>;
}

export interface ChannelActivityGroup
{
	name: ChannelActivityGroupName;
	createdAt: string;
	updatedAt: Option<string>;
	activities: Array<ChannelActivity>;
}
export interface ChannelActivityGroupRef
{
	created_at: Date;
	updated_at: Option<Date>;
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

export class ChannelActivities
{
	public groups: Array<TupleActivitiesRef> = [];

	/**
	 * Ajoute une nouvelle activité dans un groupe d'activités en fonction du
	 * dernier nom de groupe. Dans le cas où le dernier nom de groupe en place
	 * correspond à l'argument {@param group} donné, ce dernier groupe sera mis
	 * à jour, sinon un nouveau groupe est ajouté à la liste des groupes
	 * d'activités.
	 */
	upsert(
		group: ChannelActivityGroupName,
		payload: Optional<ChannelActivityRef, "previous_messages_ids">,
	)
	{
		let new_activity: ChannelActivityRef = {
			channel_id: payload.channel_id,
			nickname: payload.nickname,
			message_id: payload.message_id,
			previous_messages_ids: payload.previous_messages_ids || [],
		};

		let new_date = new Date();

		let [last_group, last_channel_activities] = this.groups.at(-1) || [];

		if (last_group === group && last_channel_activities) {
			last_channel_activities.updated_at.replace(new_date);
			last_channel_activities.activities.push(new_activity);
			return;
		}

		this.groups.push([
			group,
			{
				created_at: new_date,
				updated_at: None(),
				activities: [new_activity],
			},
		]);
	}
}
