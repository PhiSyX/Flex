// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";
import { User } from "~/user/User";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyIgnoreHandler implements SocketEventInterface<"RPL_IGNORE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_IGNORE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_IGNORE">) {
		const currentRoom = this.store.roomManager().current();

		if (data.updated) {
			currentRoom.addConnectEvent(data, data.message);
		}

		for (const user of data.users) {
			this.store.addUserToBlocklist(new User(user));

			if (data.updated) {
				currentRoom.addEvent("event:rpl_ignore", {
					...data,
					isMe: true,
				});
			}
		}
	}
}

export class ReplyUnignoreHandler
	implements SocketEventInterface<"RPL_UNIGNORE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_UNIGNORE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_UNIGNORE">) {
		const currentRoom = this.store.roomManager().current();

		currentRoom.addConnectEvent(data, data.message);

		for (const user of data.users) {
			this.store.removeUserToBlocklist(new User(user));

			currentRoom.addEvent("event:rpl_unignore", {
				...data,
				isMe: true,
			});
		}
	}
}
