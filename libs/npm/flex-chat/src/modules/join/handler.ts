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
import { ChannelRoom } from "../../channel/room";

// -------------- //
// Implémentation //
// -------------- //

export class JoinHandler implements SocketEventInterface<"JOIN">
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
		this.store.on("JOIN", (data) => this.handle(data));
	}

	handle(data: GenericReply<"JOIN">)
	{
		if (this.store.is_current_client(data.origin)) {
			this.handle_client_itself(data);
			return;
		}

		this.handle_user(data);
	}

	handle_client_itself(data: GenericReply<"JOIN">)
	{
		let channel = this.store.room_manager().get_or_insert(data.channel, 
			() => ChannelRoom.create_with_owner(data.channel, data.origin),
		);

		assert_channel_room(channel);

		channel.marks_as_opened();
		channel.set_kicked(false);

		if (!data.forced) {
			this.store.room_manager().set_current(data.channel);
		}

		channel.add_event("event:join", channel.create_event(data));
	}

	handle_user(data: GenericReply<"JOIN">)
	{
		let user = this.store.user_manager().add(data.origin)
			.with_channel(data.channel);

		this.store.room_manager().get(data.channel).then((channel) => {
			assert_channel_room(channel);
			channel.add_member(user);
			channel.add_event("event:join", channel.create_event(data, false));
		});

		this.store.room_manager().get(data.origin.id).then((priv) => {
			priv.marks_as_writable();
		});
	}
}
