// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Room } from "../../room";
import type { RoomMessageEvent } from "../../room/message";
import type { ChatStoreInterface } from "../../store";

import { MentionsCustomRoom } from "../../custom_room";
import { PrivateParticipant } from "../../private/participant";
import { PrivateRoom } from "../../private/room";
import { RoomMessage } from "../../room/message";

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
		let user = this.store.user_manager().find_by_nickname(data.target)
			.expect(`"L'utilisateur cible ${data.target}."`);
		let maybe_room = this.store.room_manager().get(user.id);
		if (maybe_room.is_none()) {
			return;
		}
		let room = maybe_room.unwrap();
		this.handle_message(room, data);
	}

	handle_user(data: GenericReply<"PRIVMSG">)
	{
		let priv = this.store.room_manager().get_or_insert(data.origin.id, () => {
			let active_room = this.store.room_manager().active();

			// @ts-expect-error : type à corriger
			active_room.add_event("event:query", active_room.create_event(
				data,
				false,
			));

			let room = new PrivateRoom(data.origin.nickname)
				.with_id(data.origin.id)
				.marks_as_closed();

			room.add_participant(
				new PrivateParticipant(data.origin)
			);
			room.add_participant(
				new PrivateParticipant(this.store.client())
					.with_is_current_client(true),
			);
			return room;
		});

		if (priv.is_closed()) {
			this.store.play_audio("query");
		}

		priv.marks_as_opened();

		this.handle_message(priv, data);
	}

	handle_message(room: Room, data: GenericReply<"PRIVMSG">)
	{
		let has_mention = false;
		
		let is_current_client = this.store.is_current_client(data.origin);
		if (!is_current_client && !room.is_active()) {
			// NOTE: Vérifie le pseudo du client courant est mentionné dans le
			// message.
			let current_client_nickname = this.store.nickname();
			if (data.text.toLowerCase()
					.indexOf(current_client_nickname.toLowerCase()) >= 0) {
				has_mention = true;
				room.set_highlighted(has_mention);
			}
		}

		let nickname = room.type === "channel" || room.type === "private"
			? data.origin.nickname
			: "*";

		room.add_message(
			new RoomMessage(data.text)
				.with_id(data.tags.msgid)
				.with_nickname(nickname)
				.with_target(data.target)
				.with_type("privmsg")
				.with_data(data)
				.with_is_current_client(is_current_client),
		);

		if (has_mention && !is_current_client) {
			let mentions_room = this.store.room_manager().get_or_insert(
				MentionsCustomRoom.ID,
				() => new MentionsCustomRoom(),
			);

			mentions_room.marks_as_opened();
			
			let event: RoomMessageEvent<"PRIVMSG"> = room.create_event(
				data,
				is_current_client,
			);
			mentions_room.add_event("event:privmsg", event, data.text);

			this.store.play_audio("mention");
		}
	}
}
