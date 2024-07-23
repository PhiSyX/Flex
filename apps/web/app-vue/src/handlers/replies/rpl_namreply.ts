// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStore } from "~/store";

import { ChannelMember, assertChannelRoom } from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyNamreplyHandler
	implements SocketEventInterface<"RPL_NAMREPLY">
{
	constructor(private store: ChatStore) {}

	listen() {
		this.store.on("RPL_NAMREPLY", (data) => this.handle(data));
		// this.store.on("RPL_ENDOFNAMES", (_data) => {});
	}

	handle(data: GenericReply<"RPL_NAMREPLY">) {
		const maybeChannel = this.store.roomManager().get(data.channel);
		if (maybeChannel.is_none()) return;

		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);

		for (const userOrigin of data.users) {
			const user = this.store
				.userManager()
				.add(userOrigin)
				.withChannel(channel.id());

			const newMember = new ChannelMember(user)
				.withIsCurrentClient(this.store.isCurrentClient(user))
				.withAccessLevel(userOrigin.access_level);

			const maybeChannelMember = channel.getMember(user.id);
			if (maybeChannelMember.is_some()) {
				channel.upgradeMember(maybeChannelMember.unwrap(), newMember);
			} else {
				channel.addMember(newMember);
			}
		}
	}
}
