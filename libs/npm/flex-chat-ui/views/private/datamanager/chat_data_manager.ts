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
	PrivateParticipant,
	PrivateRoom,
} from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	close(id: UserID) {
		this.store.close_room(id);
	}

	is_recipient_blocked(recipient: PrivateParticipant): boolean {
		return this.store.user_manager().is_blocked(recipient.id);
	}

	get(private_id: UserID): Option<PrivateRoom> {
		return this.store.room_manager().get(private_id).as<PrivateRoom>();
	}

	get_all_commands(priv: PrivateRoom): Array<string> {
		return this.store.all_commands(priv);
	}

	get_current_client_id(): UserID {
		return this.store.client_id();
	}

	get_current_client_nickname(): string {
		return this.store.nickname();
	}

	open_room(room_id: RoomID) {
		this.store.open_room(room_id);
	}

	send_to(id: UserID, message: string) {
		this.store.send_message(id, message);
	}

	ignore(nickname: Origin["nickname"]) {
		this.store.ignore_user(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.store.unignore_user(nickname);
	}
}
