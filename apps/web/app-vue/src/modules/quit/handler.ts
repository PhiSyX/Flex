// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelRoom } from "@phisyx/flex-chat";
import type { ChatStore } from "~/storage/memory/chat";

import { assertChannelRoom } from "@phisyx/flex-chat";

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
		if (this.store.isCurrentClient(data.origin)) {
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
		if (!channel.members.has(data.origin.id)) return;

		channel.addEvent("event:quit", { ...data, isCurrentClient: false });

		channel.removeMember(data.origin.id);
	}
}
