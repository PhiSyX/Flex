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
import { ChatStore } from "~/store/ChatStore";

// -------------- //
// Implémentation //
// -------------- //

export class ModeHandler implements SocketEventInterface<"MODE"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("MODE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"MODE">) {
		if (this.store.isMe(data.target)) {
			this.handleMe(data);
			return;
		}

		this.handleChannel(data);
	}

	handleMe(data: GenericReply<"MODE">) {
		const network = this.store.network();
		network.addEvent("event:mode", { ...data, isMe: true });
	}

	handleChannel(data: GenericReply<"MODE">) {
		const maybeRoom = this.store.roomManager().get(data.target);
		if (maybeRoom.is_none()) return;

		const channel = maybeRoom.unwrap();
		assertChannelRoom(channel);

		if (data.added) {
			for (const [letter, _] of Array.from(data.added)) {
				channel.setSettingMode(letter);

				if (letter === "t") {
					channel.topic.setEditable(false);
				}
			}
		}

		if (data.removed) {
			for (const [letter, _] of Array.from(data.removed)) {
				channel.unsetSettingMode(letter);

				if (letter === "t") {
					channel.topic.setEditable(true);
				}
			}
		}

		channel.addEvent("event:mode", {
			...data,
			isMe: this.store.isMe(data.origin),
		});
	}
}
