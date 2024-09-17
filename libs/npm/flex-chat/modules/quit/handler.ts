// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelRoom } from "../../channel/room";
import type { PrivateRoom } from "../../private/room";

import { assert_channel_room, assert_private_room } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class QuitHandler implements SocketEventInterface<"QUIT"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("QUIT", (data) => this.handle(data));
	}

	handle(data: GenericReply<"QUIT">) {
		if (this.store.is_current_client(data.origin)) {
			return;
		}

		for (let room of this.store.room_manager().rooms()) {
			if (room.type === "channel") {
				assert_channel_room(room);
				this.handle_channel(room, data);
			} else if (room.type === "private") {
				assert_private_room(room);
				this.handle_private(room, data);
			}
		}

		this.store.user_manager().del(data.origin.id);
	}

	handle_channel(channel: ChannelRoom, data: GenericReply<"QUIT">) {
		if (!channel.members.has(data.origin.id)) {
			return;
		}

		channel.add_event("event:quit", channel.create_event(data, false));

		channel.remove_member(data.origin.id);
	}

	handle_private(priv: PrivateRoom, data: GenericReply<"QUIT">) {
		if (!priv.participants.has(data.origin.id)) {
			return;
		}

		priv.add_event("event:quit", priv.create_event(data, false));
		priv.marks_as_readonly();
	}
}
