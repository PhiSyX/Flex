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

import { PubmsgCommand } from "./command";
import { PubmsgHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PubmsgModule implements Module<PubmsgModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PUBMSG";

	static create(store: ChatStore): PubmsgModule {
		return new PubmsgModule(new PubmsgCommand(store), new PubmsgHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PubmsgCommand,
		private handler: PubmsgHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(roomMessage: RoomID, channelsRaw?: ChannelID, ...words: Array<string>) {
		if (!roomMessage.startsWith("#")) {
			const channels = channelsRaw?.split(",") as Array<ChannelID> | undefined;
			if (!channels) return;
			const text = words.join(" ");
			this.send({ channels, text });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",") as Array<ChannelID> | undefined;
			if (!channels) return;
			const text = words.join(" ");
			this.send({ channels, text });
			return;
		}

		const channels = [roomMessage] as Array<ChannelID>;
		if (channelsRaw) {
			words.unshift(channelsRaw);
		}
		const text = words.join(" ");
		this.send({ channels, text });
	}

	send(payload: Command<"PUBMSG">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
