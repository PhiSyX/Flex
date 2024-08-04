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

class UpgradeUserHandler
	implements SocketEventInterface<"UPGRADE_USER">
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
		this.store.on("UPGRADE_USER", (data) => this.handle(data));
	}

	handle(data: GenericReply<"UPGRADE_USER">)
	{
		if (this.store.is_current_client(data.old_client_id)) {
			let client = this.store.client();
			this.store.set_client({
				id: data.new_client_id,
				nickname: data.new_nickname,
				host: client.host,
				ident: client.ident,
			});
		}

		this.store
			.user_manager()
			.change_id(data.old_client_id, data.new_client_id);

		this.store
			.user_manager()
			.change_nickname(data.old_nickname, data.new_nickname);

		for (let room of this.store.room_manager().rooms()) {
			if (room.type === "channel") {
				assert_channel_room(room);
				let maybe_member = room.members.remove(data.old_client_id);
				if (maybe_member.is_none()) {
					continue;
				}
				let member = maybe_member.unwrap();
				member.id = data.new_client_id;
				room.members.add(member);
			} else if (room.type === "private") {
				assert_private_room(room);
				let participant = room.participants.get(data.old_client_id);
				if (participant) {
					room.participants.delete(data.old_client_id);
					participant.id = data.new_client_id;
					room.participants.set(data.new_client_id, participant);
				}
			}
		}

		this.store
			.room_manager()
			.change_id(data.old_client_id, data.new_client_id);
	}
}

export default UpgradeUserHandler;
