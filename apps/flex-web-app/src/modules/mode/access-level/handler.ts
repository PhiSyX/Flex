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

export class ModeAccessLevelHandler implements SocketEventInterface<"MODE"> {
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
		if (this.store.isCurrentClient(data.target)) return;
		this.handleChannel(data);
	}

	handleChannel(data: GenericReply<"MODE">) {
		const maybeRoom = this.store.roomManager().get(data.target);
		if (maybeRoom.is_none()) return;

		const channel = maybeRoom.unwrap();
		assertChannelRoom(channel);

		function isControlAccessLetter(
			letter: string,
			_: ModeApplyFlag<unknown>,
		): _ is ModeApplyFlag<AccessControlMode> {
			return ["q", "a", "o", "h", "v"].includes(letter);
		}

		if (data.added) {
			for (const [letter, mode] of data.added) {
				if (!isControlAccessLetter(letter, mode)) continue;
			}
		}

		if (data.removed) {
			for (const [letter, mode] of data.removed) {
				if (!isControlAccessLetter(letter, mode)) continue;
			}
		}
	}
}
