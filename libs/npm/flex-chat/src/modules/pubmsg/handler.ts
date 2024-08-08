// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelRoom } from "../../channel/room";
import type { RoomMessageEvent } from "../../room/message";
import type { ChatStoreInterface } from "../../store";

import { assert_channel_room } from "../../asserts/room";
import { MentionsCustomRoom } from "../../custom_room";
import { RoomMessage } from "../../room/message";

// -------------- //
// Implémentation //
// -------------- //

export class PubmsgHandler implements SocketEventInterface<"PUBMSG">
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
		this.store.on("PUBMSG", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PUBMSG">)
	{
		let maybe_channel = this.store.room_manager().get(data.channel);
		if (maybe_channel.is_none()) {
			return;
		}
		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);
		this.handle_message(channel, data);
	}

	handle_message(room: ChannelRoom, data: GenericReply<"PUBMSG">)
	{
		let has_mention = false;

		let is_current_client = this.store.is_current_client(data.origin);

		if (!is_current_client) {
			// NOTE: Vérifie le pseudo du client courant est mentionné dans le
			// message.
			let current_client_nickname = this.store.nickname();
			if (
				data.text.toLowerCase()
					.indexOf(current_client_nickname.toLowerCase()) >= 0
			) {
				has_mention = true;

				if (!room.is_active()) {
					room.set_highlighted(has_mention);
				}
			}
		}

		let previous_messages_ids = room.messages
			.filter((msg) => !msg.is_event_type)
			.slice(-2)
			.map((msg) => msg.id);

		let message = room.add_message(
			new RoomMessage(data.text)
				.with_id(data.tags.msgid)
				.with_nickname(data.origin.nickname)
				.with_target(data.channel)
				.with_type("pubmsg")
				.with_data(data)
				.with_is_current_client(is_current_client)
				.with_mention(has_mention),
		)
			.unwrap();

		if (has_mention && !is_current_client) {
			room.activities.upsert("mention", {
				channel_id: room.id(),
				message_id: message.id,
				nickname: message.nickname,
				previous_messages_ids,
			});

			let mentions_room = this.store.room_manager().get_or_insert(
				MentionsCustomRoom.ID,
				() => new MentionsCustomRoom(),
			);
			mentions_room.marks_as_opened();
			
			let event: RoomMessageEvent<"PUBMSG"> = room.create_event(
				data,
				is_current_client,
			);
			mentions_room.add_event("event:pubmsg", event, data.text);

			this.store.play_audio("mention");
		}
	}
}
