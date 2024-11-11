// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Room } from "../room";

import { is_string } from "@phisyx/flex-asserts/primitive";

import { ChannelMember } from "../channel/member";
import { ChannelRoom } from "../channel/room";
import { PrivateRoom } from "../private/room";

// -------- //
// Fonction //
// -------- //

/**
 * Certifie que l'argument donné est une chambre de type [ChannelRoom].
 */
export function assert_channel_room(room?: {
	type: string;
}): asserts room is ChannelRoom {
	if (room?.type !== "channel") {
		throw new Error(
			`« ${room} » n'est pas une chambre de type « channel »`,
		);
	}
}

/**
 * Certifie que l'argument donné est une chambre de type [PrivateRoom].
 */
export function assert_private_room(room: {
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
export function is_channel(room: unknown): room is ChannelID {
	return (is_string(room) && room.startsWith("#")) ?? false;
}

/**
 * Certifie que la chambre passée en argument est un salon.
 */
export function is_channel_room(room?: Room): room is ChannelRoom {
	return room instanceof ChannelRoom;
}

/**
 * Certifie que la valeur donnée s'agit d'une instance d'un membre de salon.
 */
export function is_channel_member(member: unknown): member is ChannelMember {
	return member instanceof ChannelMember;
}

/**
 * Certifie que la chambre passée en argument est un privé.
 */
export function is_private_room(room?: Room): room is PrivateRoom {
	return room instanceof PrivateRoom;
}

/**
 * @type ChannelID
 */
export function cast_to_channel_id(channel_raw?: string): ChannelID {
	return channel_raw as ChannelID;
}

/**
 * @type Array<ChannelID>
 */
export function cast_to_channels_id(
	channels_raw?: Array<string>,
): Array<ChannelID> {
	return channels_raw as Array<ChannelID>;
}

/**
 * @type RoomID
 */
export function cast_to_room_id(room_id?: string): RoomID {
	return room_id as RoomID;
}
