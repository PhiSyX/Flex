// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assert_channel_room } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class ModeHandler implements SocketEventInterface<"MODE">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("MODE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"MODE">)
	{
		if (this.store.is_current_client(data.target)) {
			this.handle_client_itself(data);
			return;
		}

		this.handle_channel(data);
	}

	handle_client_itself(data: GenericReply<"MODE">)
	{
		let network = this.store.network();
		network.add_event("event:mode", { ...data, isCurrentClient: true });
	}

	handle_channel(data: GenericReply<"MODE">)
	{
		let maybe_room = this.store.room_manager().get(data.target);
		if (maybe_room.is_none()) {
			return;
		}

		let channel = maybe_room.unwrap();
		assert_channel_room(channel);

		if (data.updated) {
			channel.add_event("event:mode", {
				...data,
				isCurrentClient: this.store.is_current_client(data.origin),
			});
		}
	}
}
