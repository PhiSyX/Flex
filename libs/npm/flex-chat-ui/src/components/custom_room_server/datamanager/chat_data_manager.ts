// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	Room,
} from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	get_all_commands(room: Room): Array<string> {
		return this.store.all_commands(room);
	}

	get_current_client_nickname(): string {
		return this.store.nickname();
	}

	open_room(room_id: RoomID) {
		this.store.open_room(room_id);
	}

	send_to(room_id: RoomID, message: string) {
		this.store.send_message(room_id, message);
	}
}
