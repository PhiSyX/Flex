// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChannelMember } from "../channel/member";
import { ChannelRoom } from "../channel/room";
import type { PrivateRoom } from "../private/room";
import type { Room } from "../room";

// -------- //
// Fonction //
// -------- //

/**
 * Certifie que l'argument donné est une chambre de type [ChannelRoom].
 */
export function assertChannelRoom(room: {
	type: string;
}): asserts room is ChannelRoom {
	if (room.type !== "channel") {
		throw new Error(
			`« ${room} » n'est pas une chambre de type « channel »`,
		);
	}
}

/**
 * Certifie que l'argument donné est une chambre de type [PrivateRoom].
 */
export function assertPrivateRoom(room: {
	type: string;
}): asserts room is PrivateRoom {
	if (room.type !== "private") {
		throw new Error(
			`« ${room} » n'est pas une chambre de type « private »`,
		);
	}
}

/**
 * Certifie que la chambre passée en argument est un salon.
 */
export function isChannel(room: unknown): room is ChannelID {
	return (typeof room === "string" && room.startsWith("#")) ?? false;
}

/**
 * Certifie que la chambre passée en argument est un salon.
 */
export function isChannelRoom(room?: Room): room is ChannelRoom {
	return room instanceof ChannelRoom;
}

/**
 * Certifie que la valeur donnée s'agit d'une instance d'un membre de salon.
 */
export function isChannelMember(member: unknown): member is ChannelMember {
	return member instanceof ChannelMember;
}

/**
 * @type ChannelID
 */
export function channelID(channelRaw?: string): ChannelID {
	return channelRaw as ChannelID;
}

/**
 * @type Array<ChannelID>
 */
export function channelsID(channelRaw?: Array<string>): Array<ChannelID> {
	return channelRaw as Array<ChannelID>;
}

/**
 * @type RoomID
 */
export function roomID(roomID?: string): RoomID {
	return roomID as RoomID;
}
