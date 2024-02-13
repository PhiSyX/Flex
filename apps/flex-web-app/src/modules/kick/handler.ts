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
import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class KickHandler implements SocketEventInterface<"KICK"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("KICK", (data) => this.handle(data));
	}

	handle(data: GenericReply<"KICK">) {
		const maybeChannel = this.store.roomManager().get(data.channel);
		if (maybeChannel.is_none()) return;
		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);
		if (this.store.isMe(data.knick)) {
			this.handleMe(data, channel);
			return;
		}
		this.handleUser(data, channel);
	}

	handleMe(data: GenericReply<"KICK">, channel: ChannelRoom) {
		channel.addEvent("event:kick", { ...data, isMe: true });
		channel.removeUser(data.knick.id);
		channel.setKicked(true);
		this.store.userManager().removeChannel(data.knick.id, data.channel);
	}

	handleUser(data: GenericReply<"KICK">, channel: ChannelRoom) {
		channel.addEvent("event:kick", { ...data, isMe: false });
		channel.removeUser(data.knick.id);
		this.store.userManager().removeChannel(data.knick.id, data.channel);
	}
}
