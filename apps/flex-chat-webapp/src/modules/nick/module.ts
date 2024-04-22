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
import type { ChatStore } from "~/storage/memory/chat";

import { NickCommand } from "./command";
import { NickHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class NickModule implements Module<NickModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "NICK";

	static create(store: ChatStore): NickModule {
		return new NickModule(new NickCommand(store), new NickHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: NickCommand,
		private handler: NickHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, nickname?: string) {
		if (!nickname) return;
		this.send({ nickname });
	}

	send(payload: Command<"NICK">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
