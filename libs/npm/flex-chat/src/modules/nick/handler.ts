// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assert_channel_room, assert_private_room } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class NickHandler implements SocketEventInterface<"NICK">
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
		this.store.on("NICK", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NICK">)
	{
		this.store.user_manager().change_nickname(
			data.old_nickname,
			data.new_nickname,
		);

		let is_current_client = this.store.is_current_client(data.origin);
		if (is_current_client) {
			if (data.tags.user_id) {
				this.store.set_client_id(data.tags.user_id);
			}
			this.store.set_client_nickname(data.new_nickname);
		}

		for (let room of this.store.room_manager().rooms()) {
			room.add_event("event:nick", room.create_event(
				data,
				is_current_client,
			));

			if (room.type === "channel") {
				assert_channel_room(room);

				let user = this.store.user_manager()
					.find_by_nickname(data.new_nickname)
					.expect(`L'utilisateur ${data.new_nickname}.`);

				if (!room.members.has(user.id)) {
					continue;
				}

				room.members.change_nickname(
					data.origin.id,
					data.old_nickname,
					data.new_nickname,
				);
			} else if (room.type === "private") {
				if (!room.eq(data.old_nickname)) {
					continue;
				}

				assert_private_room(room);

				room.change_name(data.new_nickname);
			}
		}
	}
}
