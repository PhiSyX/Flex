// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Room } from "~/room/Room";
import { RoomMessage } from "~/room/RoomMessage";
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class PubmsgHandler implements SocketEventInterface<"PUBMSG"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("PUBMSG", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PUBMSG">) {
		const maybeChannel = this.store.roomManager().get(data.channel);
		if (maybeChannel.is_none()) return;
		const channel = maybeChannel.unwrap();
		this.handleMessage(channel, data);
	}

	handleMessage(room: Room, data: GenericReply<"PUBMSG">) {
		let hl = false;

		const isCurrentClient = this.store.isCurrentClient(data.origin);
		if (!isCurrentClient && !room.isActive()) {
			const me = this.store.nickname();
			if (data.text.toLowerCase().indexOf(me.toLowerCase()) >= 0) {
				hl = true;
				room.setHighlight(hl);
			}
		}

		room.addMessage(
			new RoomMessage()
				.withID(data.tags.msgid)
				.withMessage(data.text)
				.withNickname(data.origin.nickname)
				.withTarget(data.channel)
				.withTime(new Date())
				.withType("pubmsg")
				.withData(data)
				.withIsCurrentClient(isCurrentClient),
		);
	}
}
