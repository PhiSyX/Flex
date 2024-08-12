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
import type { RoomMessage, RoomMessageEvent } from "../../room/message";
import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";

import { assert_channel_room, is_channel } from "../../asserts/room";
import { NoticesCustomRoom } from "../../custom_room/notices";

// -------------- //
// Implémentation //
// -------------- //

export class NoticeHandler implements SocketEventInterface<"NOTICE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("NOTICE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NOTICE">)
	{
		let is_current_client = this.store.is_current_client(data.origin);
		let room = this.store.room_manager().active();

		let event: RoomMessageEvent<"NOTICE"> = room.create_event(
			data,
			is_current_client,
		);
		let message = room.add_event(
			"event:notice",
			event,
			data.text,
		);

		if (
			!is_current_client ||
			(is_current_client && is_channel(data.target))
		) {
			let notice_room = this.store.room_manager().get_or_insert(
				NoticesCustomRoom.ID,
				() => new NoticesCustomRoom(),
			);

			notice_room.marks_as_opened();

			if (room.id() !== NoticesCustomRoom.ID) {
				notice_room.add_event("event:notice", event, data.text);
			}
		}

		// NOTE: envoie la notice dans le panel d'activité du salon.
		if (!is_current_client && is_channel(data.target)) {
			let maybe_channel = this.store.room_manager().get(data.target);

			if (maybe_channel.is_some()) {
				let channel = maybe_channel.unwrap();
				assert_channel_room(channel);
				this.handle_channel(channel, event, message);
			}
		}

		if (!is_current_client) {
			this.store.play_audio("notice");
		}
	}

	handle_channel(
		channel: ChannelRoom,
		payload: RoomMessageEvent<"NOTICE">,
		message: RoomMessage,
	)
	{
		channel.activities.upsert("notice", {
			channel_id: channel.id(),
			nickname: payload.origin.nickname,
			message_id: message.id,
		});
	}
}
