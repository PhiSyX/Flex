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

export class ReplySilenceHandler implements SocketEventInterface<"SILENCE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("SILENCE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"SILENCE">) {
		const currentRoom = this.store.roomManager().active();

		if (data.updated) {
			const message = "Votre liste des utilisateurs ignorés a été mis à jour";
			currentRoom.addConnectEvent(data, message);
		}

		for (const user of data.users) {
			if (data.added) {
				this.store.addUserToBlocklist(new User(user));
			}

			if (data.removed) {
				this.store.removeUserToBlocklist(new User(user));
			}

			if (data.updated) {
				currentRoom.addEvent("event:silence", {
					...data,
					isMe: true,
				});
			}
		}
	}
}
