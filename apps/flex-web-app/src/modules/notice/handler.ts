// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { NoticeCustomRoom } from "~/custom-room/NoticeCustomRoom";
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class NoticeHandler implements SocketEventInterface<"NOTICE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("NOTICE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NOTICE">) {
		const isMe = this.store.isMe(data.origin);
		const activeRoom = this.store.roomManager().active();

		const payload = { ...data, isMe };
		activeRoom.addEvent("event:notice", payload);

		if (!isMe) {
			const noticeRoom = this.store
				.roomManager()
				.getOrInsert(NoticeCustomRoom.ID, () => new NoticeCustomRoom());

			if (activeRoom.id() !== NoticeCustomRoom.ID) {
				noticeRoom.addEvent("event:notice", payload);
			}
		}
	}
}
