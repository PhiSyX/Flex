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
import { ChannelMember } from "../../channel/member";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyNamreplyHandler
	implements SocketEventInterface<"RPL_NAMREPLY">
{
	constructor(private store: ChatStoreInterface)
	{}

	listen()
	{
		this.store.on("RPL_NAMREPLY", (data) => this.handle(data));
		// this.store.on("RPL_ENDOFNAMES", (_data) => {});
	}

	handle(data: GenericReply<"RPL_NAMREPLY">)
	{
		let maybe_channel = this.store.room_manager().get(data.channel);
		if (maybe_channel.is_none()) {
			return;
		}

		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);

		for (let user_origin of data.users) {
			let user = this.store.user_manager().add(user_origin)
				.with_channel(channel.id());

			let new_member = new ChannelMember(user)
				.with_is_current_client(this.store.is_current_client(user))
				.with_access_level(...user_origin.access_level);

			let maybe_channel_member = channel.get_member(user.id);
			if (maybe_channel_member.is_some()) {
				channel.upgrade_member(maybe_channel_member.unwrap(), new_member);
			} else {
				channel.add_member(new_member);
			}
		}
	}
}
