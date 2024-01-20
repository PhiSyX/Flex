// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";
import { Room } from "~/room/Room";
import { RoomMessage } from "~/room/RoomMessage";
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class PrivmsgHandler implements SocketEventInterface<"PRIVMSG"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("PRIVMSG", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PRIVMSG">) {
		if (data.target.startsWith("#")) {
			this.handleChannel(data);
			return;
		}

		if (this.store.isMe(data.origin)) {
			this.handleMe(data);
			return;
		}

		this.handleUser(data);
	}

	handleChannel(data: GenericReply<"PRIVMSG">) {
		const maybeChannel = this.store.roomManager().get(data.target);
		if (maybeChannel.is_none()) return;
		const channel = maybeChannel.unwrap();
		this.handleMessage(channel, data);
	}

	handleMe(data: GenericReply<"PRIVMSG">) {
		const maybeRoom = this.store.roomManager().get(data.target);
		if (maybeRoom.is_none()) return;
		const room = maybeRoom.unwrap();
		this.handleMessage(room, data);
	}

	handleUser(data: GenericReply<"PRIVMSG">) {
		const priv = this.store
			.roomManager()
			.getOrInsert(data.origin.nickname, () => {
				this.store
					.roomManager()
					.current()
					// @ts-expect-error : type à corriger
					.addEvent("event:query", { ...data, isMe: false });
				const room = new PrivateRoom(data.origin.nickname);
				room.addParticipant(new PrivateNick(data.origin));
				room.addParticipant(new PrivateNick(this.store.me()));
				return room;
			});

		this.handleMessage(priv, data);
	}

	handleMessage(room: Room, data: GenericReply<"PRIVMSG">) {
		let hl = false;

		const isMe = this.store.isMe(data.origin);
		if (!isMe && !room.isActive()) {
			const me = this.store.nickname();
			if (data.text.toLowerCase().indexOf(me.toLowerCase()) >= 0) {
				hl = true;
				room.setHighlight(hl);
			}
		}

		const nickname =
			room.type === "channel" || room.type === "private"
				? data.origin.nickname
				: "*";

		room.addMessage(
			new RoomMessage()
				.withID(data.tags.msgid)
				.withMessage(data.text)
				.withNickname(nickname)
				.withTarget(data.target)
				.withTime(new Date())
				.withType("privmsg")
				.withData(data)
				.withIsMe(isMe),
		);
	}
}
