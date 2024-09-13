// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";
import type { PrivateParticipant } from "../../../private/participant";
import type { PrivateRoom } from "../../../private/room";
import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../../store";
import type { User } from "../../../user";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	close(id: UserID) {
		this.store.close_room(id);
	}

	is_recipient_blocked(recipient: PrivateParticipant): boolean {
		// NOTE: `PrivateParticipant` étend de `User`, caster ne pose pas souci.
		return this.store.is_user_blocked(recipient as User);
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
