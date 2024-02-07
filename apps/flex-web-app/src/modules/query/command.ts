// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";
import { ChatStore } from "~/store/ChatStore";
import { User } from "~/user/User";

// -------------- //
// Implémentation //
// -------------- //

export class QueryCommand {
	constructor(private store: ChatStore) {}

	handle(roomName: string) {
		const maybeUser = this.store.userManager().findByNickname(roomName);
		if (maybeUser.is_none()) return;
		const user = maybeUser.unwrap();

		const room = this.store.roomManager().getOrInsert(user.id, () => {
			const priv = new PrivateRoom(user.nickname).withID(user.id);
			priv.addParticipant(new PrivateNick(new User(this.store.me())).withIsMe(true));
			priv.addParticipant(new PrivateNick(user));
			return priv;
		});

		room.unsetTotalUnreadEvents();
		room.unsetTotalUnreadMessages();

		this.store.roomManager().setCurrent(room.id());
	}
}
