// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assertChannelRoom } from "../../asserts/room";
import type { ChannelRoom } from "../../channel/room";
import { RoomMessage } from "../../room/message";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class PubmsgHandler implements SocketEventInterface<"PUBMSG"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

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
		assertChannelRoom(channel);
		this.handleMessage(channel, data);
	}

	handleMessage(room: ChannelRoom, data: GenericReply<"PUBMSG">) {
		let hasMention = false;

		const isCurrentClient = this.store.isCurrentClient(data.origin);

		if (!isCurrentClient) {
			// NOTE: Vérifie le pseudo du client courant est mentionné dans le
			// message.
			const currentClientNickname = this.store.nickname();
			if (
				data.text
					.toLowerCase()
					.indexOf(currentClientNickname.toLowerCase()) >= 0
			) {
				hasMention = true;

				if (!room.isActive()) {
					room.setHighlighted(hasMention);
				}
			}
		}

		let previousMsgs = room.messages
			.filter((msg) => !msg.isEventType)
			.slice(-2)
			.map((msg) => msg.id);

		let msg = room.addMessage(
			new RoomMessage()
				.withID(data.tags.msgid)
				.withMessage(data.text)
				.withNickname(data.origin.nickname)
				.withTarget(data.channel)
				.withTime(new Date())
				.withType("pubmsg")
				.withData(data)
				.withIsCurrentClient(isCurrentClient)
				.withMention(hasMention),
		);

		if (hasMention && !isCurrentClient) {
			room.activities.upsert("mention", {
				channelID: room.id(),
				messageID: msg.id,
				nickname: msg.nickname,
				previousMessageIDs: previousMsgs,
			});
		}
	}
}
