// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { NoticeCustomRoom } from "../../custom_room/notice";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class NoticeHandler implements SocketEventInterface<"NOTICE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("NOTICE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"NOTICE">) {
		const isCurrentClient = this.store.isCurrentClient(data.origin);
		const activeRoom = this.store.roomManager().active();

		const payload = { ...data, isCurrentClient };
		activeRoom.addEvent("event:notice", payload);

		if (!isCurrentClient) {
			const noticeRoom = this.store
				.roomManager()
				.getOrInsert(NoticeCustomRoom.ID, () => new NoticeCustomRoom());

			if (activeRoom.id() !== NoticeCustomRoom.ID) {
				noticeRoom.addEvent("event:notice", payload);
			}
		}
	}
}
