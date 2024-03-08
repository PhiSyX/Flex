// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStore } from "~/store/ChatStore";

import { assertChannelRoom, assertPrivateRoom } from "~/asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class NickHandler implements SocketEventInterface<"NICK"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("NICK", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NICK">) {
		this.store.userManager().changeNickname(data.old_nickname, data.new_nickname);

		const isCurrentClient = this.store.isCurrentClient(data.origin);
		if (isCurrentClient) {
			this.store.setClientNickname(data.new_nickname);
		}

		for (const room of this.store.roomManager().rooms()) {
			room.addEvent("event:nick", { ...data, isCurrentClient: isCurrentClient });

			if (room.type === "channel") {
				assertChannelRoom(room);

				const user = this.store
					.userManager()
					.findByNickname(data.new_nickname)
					.expect(`L'utilisateur ${data.new_nickname}.`);

				if (!room.members.has(user.id)) {
					continue;
				}

				room.members.changeNickname(data.origin.id, data.old_nickname, data.new_nickname);
			} else if (room.type === "private") {
				if (!room.eq(data.old_nickname)) {
					continue;
				}

				assertPrivateRoom(room);

				room.changeName(data.new_nickname);
			}
		}
	}
}
