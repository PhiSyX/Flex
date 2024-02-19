// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";

import { Module } from "~/modules/interface";
import { BanCommand, UnbanCommand } from "./command";
import { BanHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class BanModule implements Module<BanModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "BAN";

	static create(store: ChatStore): BanModule {
		return new BanModule(new BanCommand(store), new BanHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: BanCommand,
		private handler: BanHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(roomName?: string, channelsRaw?: string, ...masksRaw: Array<string>) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw;
		this.send({ channels, masks });
	}

	send(payload: Command<"BAN">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}

export class UnbanModule implements Module<UnbanModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "UNBAN";

	static create(store: ChatStore): UnbanModule {
		return new UnbanModule(new UnbanCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: UnbanCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(roomName?: string, channelsRaw?: string, ...masksRaw: Array<string>) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw;
		this.send({ channels, masks });
	}

	send(payload: Command<"UNBAN">) {
		this.command.send(payload);
	}

	listen() {}
}
