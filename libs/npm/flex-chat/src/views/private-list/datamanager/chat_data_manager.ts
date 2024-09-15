// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateRoom } from "../../../private/room";
import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../../store";

import { is_private_room } from "../../../asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateListChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	get_privates_waiting(): Array<PrivateRoom> {
		return this.store
			.room_manager()
			.rooms()
			.filter((room) => {
				if (!is_private_room(room)) {
					return false;
				}
				return room.is_pending() && room.is_closed();
			}) as Array<PrivateRoom>;
	}

	/**
	 * Ouvre un privé qui est en état d'attente.
	 */
	open_pending_private(origin: Origin) {
		let maybe_priv = this.store.room_manager().get(origin.id, {
			where: { state: "closed" },
		});
		if (maybe_priv.is_none()) {
			return;
		}
		let priv = maybe_priv.unwrap();
		priv.marks_as_opened();
		this.store.room_manager().set_current(priv.id());
	}
}
