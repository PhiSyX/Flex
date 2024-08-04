// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { PrivateParticipant } from "../../private/participant";
import { PrivateRoom } from "../../private/room";
import type { Room } from "../../room";
import { RoomMessage } from "../../room/message";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class PrivmsgHandler implements SocketEventInterface<"PRIVMSG">
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
		this.store.on("PRIVMSG", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PRIVMSG">)
	{
		if (this.store.is_current_client(data.origin)) {
			this.handle_client_itself(data);
			return;
		}

		this.handle_user(data);
	}

	handle_client_itself(data: GenericReply<"PRIVMSG">)
	{
		let user = this.store
			.user_manager()
			.find_by_nickname(data.target)
			.expect(`"L'utilisateur cible ${data.target}."`);
		let maybe_room = this.store.room_manager().get(user.id);
		if (maybe_room.is_none()) return;
		let room = maybe_room.unwrap();
		this.handle_message(room, data);
	}

	handle_user(data: GenericReply<"PRIVMSG">)
	{
		let priv = this.store
			.room_manager()
			.get_or_insert(data.origin.id, () => {
				this.store
					.room_manager()
					.active()
					// @ts-expect-error : type à corriger
					.add_event("event:query", {
						...data,
						isCurrentClient: false,
					});
				let room = new PrivateRoom(data.origin.nickname).with_id(
					data.origin.id,
				);
				room.add_participant(new PrivateParticipant(data.origin));
				room.add_participant(
					new PrivateParticipant(
						this.store.client(),
					).with_is_current_client(true),
				);
				return room;
			});

		this.handle_message(priv, data);
	}

	handle_message(room: Room, data: GenericReply<"PRIVMSG">)
	{
		let is_current_client = this.store.is_current_client(data.origin);
		if (!is_current_client && !room.is_active()) {
			// NOTE: Vérifie le pseudo du client courant est mentionné dans le
			// message.
			let current_client_nickname = this.store.nickname();
			if (data.text.toLowerCase()
					.indexOf(current_client_nickname.toLowerCase()) >= 0) {
				room.set_highlighted(true);
			}
		}

		let nickname =
			room.type === "channel" || room.type === "private"
				? data.origin.nickname
				: "*";

		room.add_message(
			new RoomMessage()
				.with_id(data.tags.msgid)
				.with_message(data.text)
				.with_nickname(nickname)
				.with_target(data.target)
				.with_time(new Date())
				.with_type("privmsg")
				.with_data(data)
				.with_is_current_client(is_current_client),
		);
	}
}
