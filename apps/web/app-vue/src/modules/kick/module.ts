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

import { KickCommand } from "./command";
import { KickHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class KickModule implements Module<KickModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "KICK";

	static create(store: ChatStore): KickModule {
		return new KickModule(new KickCommand(store), new KickHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: KickCommand,
		private handler: KickHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		_: string,
		channelsRaw?: ChannelID,
		knicksRaw?: string,
		...words: Array<string>
	) {
		const channels = channelsRaw?.split(",");
		const knicks = knicksRaw?.split(",");
		if (!channels || !knicks) return;
		const comment = words.join(" ") || "Kick.";
		this.send({ channels, knicks, comment });
	}

	send(payload: Command<"KICK">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
