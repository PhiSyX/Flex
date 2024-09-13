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
import type { Module } from "../interface";

import { is_channel } from "../../asserts/room";
import { InviteCommand } from "./command";
import { InviteHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class InviteModule implements Module<InviteModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "INVITE";

	static create(store: ChatStoreInterface): InviteModule {
		return new InviteModule(
			new InviteCommand(store),
			new InviteHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: InviteCommand,
		private handler: InviteHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, nickname?: string, channel_raw?: ChannelID) {
		if (!nickname) {
			return;
		}

		let channel = room_id;
		if (channel_raw) {
			channel = channel_raw;
		}

		if (!is_channel(channel)) {
			return;
		}

		this.send({ nickname, channel });
	}

	send(payload: Command<"INVITE">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
