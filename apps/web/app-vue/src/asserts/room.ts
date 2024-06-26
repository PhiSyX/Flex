// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelRoom } from "~/channel/room";
import type { PrivateRoom } from "~/private/room";

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
export function isChannel(room?: string): room is ChannelID {
	return room?.startsWith("#") ?? false;
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
