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
import { ChannelMember } from "~/channel/ChannelMember";
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
		if (this.store.isCurrentClient(data.origin)) {
			this.handleMe(data);
			return;
		}

		this.handleUser(data);
	}

	handleMe(data: GenericReply<"JOIN">) {
		const user = new User(data.origin);

		const channel = this.store
			.roomManager()
			.getOrInsert(data.channel, () => ChannelRoom.createWithOwner(data.channel, user));

		assertChannelRoom(channel);

		channel.setKicked(false);

		if (!data.forced) {
			this.store.roomManager().setCurrent(data.channel);
		}

		channel.addEvent("event:join", { ...data, isCurrentClient: true });
	}

	handleUser(data: GenericReply<"JOIN">) {
		const user = this.store.userManager().add(data.origin).withChannel(data.channel);

		const maybeChannel = this.store.roomManager().get(data.channel);

		if (maybeChannel.is_none()) return;

		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);
		const newMember = new ChannelMember(user);
		channel.addMember(newMember);

		channel.addEvent("event:join", { ...data, isCurrentClient: false });
	}
}
