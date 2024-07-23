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
import type { ChatStore } from "~/store";

import { JoinCommand, SajoinCommand } from "./command";
import { JoinHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class JoinModule implements Module<JoinModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "JOIN";

	static create(store: ChatStore): JoinModule {
		return new JoinModule(new JoinCommand(store), new JoinHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: JoinCommand,
		private handler: JoinHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, channelsRaw?: ChannelID, keysRaw?: string) {
		const channels = channelsRaw?.split(",") as Array<ChannelID>;
		if (!channels) return;
		const keys = keysRaw?.split(",");
		this.send({ channels, keys });
	}

	send(payload: Command<"JOIN">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}

export class SajoinModule implements Module<SajoinModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SAJOIN";

	static create(store: ChatStore): SajoinModule {
		return new SajoinModule(new SajoinCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SajoinCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, nicknamesRaw?: string, channelsRaw?: ChannelID) {
		const nicknames = nicknamesRaw?.split(",");
		const channels = channelsRaw?.split(",") as Array<ChannelID>;
		if (!nicknames || !channels) return;
		this.send({ nicknames, channels });
	}

	send(payload: Command<"SAJOIN">) {
		this.command.send(payload);
	}

	listen() {}
}
