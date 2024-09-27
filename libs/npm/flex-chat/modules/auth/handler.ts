// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";

import { assert_channel_room, assert_private_room } from "../../asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class UpgradeUserHandler
	implements SocketEventInterface<"UPGRADE_USER">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("UPGRADE_USER", (data) => this.handle(data));
	}

	handle(data: GenericReply<"UPGRADE_USER">) {
		if (this.store.is_current_client(data.old_client_id)) {
			let client = this.store.client();
			this.store.set_client({
				id: data.new_client_id,
				nickname: data.new_nickname,
				host: client.host,
				ident: client.ident,
			});

			if (data.user_session) {
				this.store.user().session(data.user_session);
			}
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
				room.members.add(member.with_id(data.new_client_id));
			} else if (room.type === "private") {
				assert_private_room(room);

				let maybe_participant = room.get_participant(
					data.old_client_id,
				);
				if (maybe_participant.is_none()) {
					continue;
				}

				let participant = maybe_participant.unwrap();
				room.del_participant(data.old_client_id);
				room.add_participant(participant.with_id(data.new_client_id));
				this.store
					.room_manager()
					.change_id(data.old_client_id, data.new_client_id);
			}
		}
	}
}
