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

// -------------- //
// Implémentation //
// -------------- //

export class PartHandler implements SocketEventInterface<"PART"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("PART", (data) => this.handle(data));
	}

	handle(data: GenericReply<"PART">) {
		const maybeChannel = this.store.roomManager().get(data.channel);

		if (maybeChannel.is_none()) return;

		const channel = maybeChannel.unwrap();
		assertChannelRoom(channel);

		if (this.store.isMe(data.origin)) {
			this.handleMe(data, channel);
			return;
		}

		this.handleUser(data, channel);
	}

	handleMe(_: GenericReply<"PART">, channel: ChannelRoom) {
		this.store.roomManager().remove(channel.name);
		// FIXME(phisyx): Définir la chambre courante à la chambre juste au
		// dessus ou en au dessous de la chambre venant d'être fermée.
		this.store.roomManager().setCurrentToLast();
	}

	handleUser(data: GenericReply<"PART">, channel: ChannelRoom) {
		channel.addEvent("event:part", { ...data, isMe: false });
		setTimeout(() => {
			channel.removeUser(data.origin.nickname);
		}, 1 << 6);
	}
}