// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assertChannelRoom } from "~/asserts/room";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class QuitHandler implements SocketEventInterface<"QUIT"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("QUIT", (data) => this.handle(data));
	}

	handle(data: GenericReply<"QUIT">) {
		if (this.store.isMe(data.origin)) {
			// FIXME
			window.location.reload();
			return;
		}

		for (const room of this.store.roomManager().rooms()) {
			if (room.type === "channel") {
				assertChannelRoom(room);
				this.handleChannel(data, room);
			}
		}
	}

	handleChannel(data: GenericReply<"QUIT">, channel: ChannelRoom) {
		if (!channel.users.has(data.origin.nickname)) return;

		channel.addEvent("event:quit", { ...data, isMe: false });

		setTimeout(() => {
			channel.removeUser(data.origin.nickname);
		}, 1 << 6);
	}
}
