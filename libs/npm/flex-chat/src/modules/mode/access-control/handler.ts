// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../../store";

import { assert_channel_room } from "../../../asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class ModeAccessControlHandler implements SocketEventInterface<"MODE">
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
		this.store.on("MODE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"MODE">)
	{
		if (this.store.is_current_client(data.target)) {
			return;
		}
		this.handle_channel(data);
	}

	handle_channel(data: GenericReply<"MODE">)
	{
		let maybe_room = this.store.room_manager().get(data.target);
		if (maybe_room.is_none()) {
			return;
		}

		let channel = maybe_room.unwrap();
		assert_channel_room(channel);

		function is_control_access_letter_allowed(
			letter: string,
			// biome-ignore lint/suspicious/noExplicitAny: ?
			mode: ModeApplyFlag<any>,
		): mode is ModeApplyFlag<AccessControlMode> {
			return ["b", "e", "I"].includes(letter) && "mask" in mode.flag;
		}

		if (data.added) {
			for (let [letter, mode] of data.added) {
				if (!is_control_access_letter_allowed(letter, mode)) {
					continue;
				}

				let mask_addr = [
					mode.flag.mask.nick,  "!",
					mode.flag.mask.ident, "@",
					mode.flag.mask.host
				].join("") as MaskAddr;

				if (letter === "b") {
					channel.access_control.banlist.set(mask_addr, mode);
				} else if (letter === "e") {
					channel.access_control.banlist_exception.set(mask_addr, mode);
				} else if (letter === "I") {
					channel.access_control.invitelist_exception.set(mask_addr, mode);
				}
			}
		}

		if (data.removed) {
			for (let [letter, mode] of data.removed) {
				if (!is_control_access_letter_allowed(letter, mode)) {
					continue;
				}

				let mask_addr = [
					mode.flag.mask.nick,  "!",
					mode.flag.mask.ident, "@",
					mode.flag.mask.host
				].join("") as MaskAddr;

				if (letter === "b") {
					channel.access_control.banlist.delete(mask_addr);
				} else if (letter === "e") {
					channel.access_control.banlist_exception.delete(mask_addr);
				} else if (letter === "I") {
					channel.access_control.invitelist_exception.delete(mask_addr);
				}
			}
		}
	}
}
