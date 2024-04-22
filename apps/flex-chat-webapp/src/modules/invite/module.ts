// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Module } from "~/modules/interface";
import type { ChatStore } from "~/store/ChatStore";

import { isChannel } from "~/asserts/room";
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

	static create(store: ChatStore): InviteModule {
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

	input(roomName: RoomID, nickname?: string, channelRaw?: ChannelID) {
		if (!nickname) return;
		let channel = roomName;
		if (channelRaw) {
			channel = channelRaw;
		}
		if (!isChannel(channel)) return;
		this.send({ nickname, channel });
	}

	send(payload: Command<"INVITE">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
