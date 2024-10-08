// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../store";

import { assert_channel_room } from "../../asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class KickHandler implements SocketEventInterface<"KICK"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("KICK", (data) => this.handle(data));
	}

	handle(data: GenericReply<"KICK">) {
		let maybe_channel = this.store.room_manager().get(data.channel);
		if (maybe_channel.is_none()) {
			return;
		}
		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);

		let is_current_client = this.store.is_current_client(data.knick);
		let event = channel.create_event(data, is_current_client);

		channel.add_event("event:kick", event);
		channel.remove_member(data.knick.id);

		if (is_current_client) {
			channel.set_kicked(true);
			this.store.network().add_event("event:kick", event);
		}

		this.store.user_manager().remove_channel(data.knick.id, data.channel);
	}
}
