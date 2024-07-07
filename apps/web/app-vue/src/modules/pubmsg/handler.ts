// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Room } from "@phisyx/flex-chat";
import type { ChatStore } from "~/storage/memory/chat";

import { RoomMessage } from "@phisyx/flex-chat";

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
		this.handleClientItselfssage(channel, data);
	}

	handleClientItselfssage(room: Room, data: GenericReply<"PUBMSG">) {
		const isCurrentClient = this.store.isCurrentClient(data.origin);
		if (!isCurrentClient && !room.isActive()) {
			// NOTE: Vérifie le pseudo du client courant est mentionné dans le
			// message.
			const currentClientNickname = this.store.nickname();
			if (
				data.text
					.toLowerCase()
					.indexOf(currentClientNickname.toLowerCase()) >= 0
			) {
				room.setHighlighted(true);
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
