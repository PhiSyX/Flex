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

export class ModeAccessControlHandler implements SocketEventInterface<"MODE"> {
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
			// biome-ignore lint/suspicious/noExplicitAny: ?
			mode: ModeApplyFlag<any>,
		): mode is ModeApplyFlag<AccessControlMode> {
			return ["b", "e"].includes(letter) && "mask" in mode.flag;
		}

		if (data.added) {
			for (const [letter, mode] of data.added) {
				if (!isControlAccessLetter(letter, mode)) {
					continue;
				}

				const maskAddr =
					`${mode.flag.mask.nick}!${mode.flag.mask.ident}@${mode.flag.mask.host}` as MaskAddr;

				if (letter === "b") {
					channel.accessControl.banlist.set(maskAddr, mode);
				}
				if (letter === "e") {
					channel.accessControl.banlistException.set(maskAddr, mode);
				}
			}
		}

		if (data.removed) {
			for (const [letter, mode] of data.removed) {
				if (!isControlAccessLetter(letter, mode)) {
					continue;
				}

				const maskAddr =
					`${mode.flag.mask.nick}!${mode.flag.mask.ident}@${mode.flag.mask.host}` as MaskAddr;

				if (letter === "b") {
					channel.accessControl.banlist.delete(maskAddr);
				}
				if (letter === "e") {
					channel.accessControl.banlistException.delete(maskAddr);
				}
			}
		}
	}
}
