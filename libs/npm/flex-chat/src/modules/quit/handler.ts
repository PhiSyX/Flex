// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assert_channel_room } from "../../asserts/room";
import type { ChannelRoom } from "../../channel/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class QuitHandler implements SocketEventInterface<"QUIT">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("QUIT", (data) => this.handle(data));
	}

	handle(data: GenericReply<"QUIT">)
	{
		if (this.store.is_current_client(data.origin)) {
			return;
		}

		for (let room of this.store.room_manager().rooms()) {
			if (room.type === "channel") {
				assert_channel_room(room);
				this.handle_channel(room, data);
			}
		}
	}

	handle_channel(channel: ChannelRoom, data: GenericReply<"QUIT">)
	{
		if (!channel.members.has(data.origin.id)) {
			return;
		}

		channel.add_event("event:quit", channel.create_event(data, false));

		channel.remove_member(data.origin.id);
	}
}
