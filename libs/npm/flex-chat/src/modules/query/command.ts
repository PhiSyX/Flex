// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { PrivateParticipant } from "../../private/participant";
import { PrivateRoom } from "../../private/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class QueryCommand {
	constructor(private store: ChatStoreInterface)
	{}

	handle(room_id: RoomID)
	{
		let maybe_user = this.store.user_manager().find_by_nickname(room_id);
		if (maybe_user.is_none()) return;
		let user = maybe_user.unwrap();

		let room = this.store.room_manager().get_or_insert(user.id, () => {
			let priv = new PrivateRoom(user.nickname).with_id(user.id);
			priv.add_participant(
				new PrivateParticipant(this.store.client()).with_is_current_client(
					true,
				),
			);
			priv.add_participant(new PrivateParticipant(user));
			return priv;
		});

		this.store.room_manager().set_current(room.id());
	}
}
