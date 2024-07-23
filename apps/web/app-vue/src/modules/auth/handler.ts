// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assertChannelRoom, assertPrivateRoom } from "@phisyx/flex-chat";
import type { ChatStore } from "~/store";

// -------------- //
// Implémentation //
// -------------- //

export class UpgradeUserHandler
	implements SocketEventInterface<"UPGRADE_USER">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("UPGRADE_USER", (data) => this.handle(data));
	}

	handle(data: GenericReply<"UPGRADE_USER">) {
		if (this.store.isCurrentClient(data.old_client_id)) {
			let client = this.store.client();
			this.store.setClient({
				id: data.new_client_id,
				nickname: data.new_nickname,
				host: client.host,
				ident: client.ident,
			});
		}

		this.store
			.userManager()
			.changeId(data.old_client_id, data.new_client_id);

		this.store
			.userManager()
			.changeNickname(data.old_nickname, data.new_nickname);

		for (const room of this.store.roomManager().rooms()) {
			if (room.type === "channel") {
				assertChannelRoom(room);
				const maybeMember = room.members.remove(data.old_client_id);
				if (maybeMember.is_none()) continue;
				const member = maybeMember.unwrap();
				member.id = data.new_client_id;
				room.members.add(member);
			} else if (room.type === "private") {
				assertPrivateRoom(room);
				const participant = room.participants.get(data.old_client_id);
				if (participant) {
					room.participants.delete(data.old_client_id);
					participant.id = data.new_client_id;
					room.participants.set(data.new_client_id, participant);
				}
			}
		}

		this.store
			.roomManager()
			.changeId(data.old_client_id, data.new_client_id);
	}
}
