// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { assertChannelRoom } from "~/asserts/room";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChatStore } from "~/store/ChatStore";
import { User } from "~/user/User";

// -------------- //
// Implémentation //
// -------------- //

export class JoinHandler implements SocketEventInterface<"JOIN"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("JOIN", (data) => this.handle(data));
	}

	handle(data: GenericReply<"JOIN">) {
		if (this.store.isMe(data.origin)) {
			this.handleMe(data);
			return;
		}

		this.handleUser(data);
	}

	handleMe(data: GenericReply<"JOIN">) {
		const channel = this.store
			.roomManager()
			.getOrInsert(data.channel, () =>
				ChannelRoom.createWithOwner(data.channel, data.origin),
			);

		assertChannelRoom(channel);

		if (!data.forced) {
			this.store.roomManager().setCurrent(data.channel);
		}

		setTimeout(() => {
			channel.addEvent("event:join", { ...data, isMe: true });
		}, 1 << 6);
	}

	handleUser(data: GenericReply<"JOIN">) {
		this.store.addUser(new User(data.origin));

		const maybeChannel = this.store.roomManager().get(data.channel);

		if (maybeChannel.is_none()) return;

		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);
		const nick = new ChannelNick(data.origin);
		channel.addUser(nick);

		setTimeout(() => {
			channel.addEvent("event:join", { ...data, isMe: false });
		}, 1 << 6);
	}
}
