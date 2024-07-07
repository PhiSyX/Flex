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

import {
	PrivateParticipant,
	PrivateRoom,
	RoomMessage,
} from "@phisyx/flex-chat";

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
		if (this.store.isCurrentClient(data.origin)) {
			this.handleClientItself(data);
			return;
		}

		this.handleUser(data);
	}

	handleClientItself(data: GenericReply<"PRIVMSG">) {
		const user = this.store
			.userManager()
			.findByNickname(data.target)
			.expect(`"L'utilisateur cible ${data.target}."`);
		const maybeRoom = this.store.roomManager().get(user.id);
		if (maybeRoom.is_none()) return;
		const room = maybeRoom.unwrap();
		this.handleClientItselfssage(room, data);
	}

	handleUser(data: GenericReply<"PRIVMSG">) {
		const priv = this.store
			.roomManager()
			.getOrInsert(data.origin.id, () => {
				this.store
					.roomManager()
					.active()
					// @ts-expect-error : type à corriger
					.addEvent("event:query", {
						...data,
						isCurrentClient: false,
					});
				const room = new PrivateRoom(data.origin.nickname).withID(
					data.origin.id,
				);
				room.addParticipant(new PrivateParticipant(data.origin));
				room.addParticipant(
					new PrivateParticipant(
						this.store.client(),
					).withIsCurrentClient(true),
				);
				return room;
			});

		this.handleClientItselfssage(priv, data);
	}

	handleClientItselfssage(room: Room, data: GenericReply<"PRIVMSG">) {
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
				.withIsCurrentClient(isCurrentClient),
		);
	}
}
