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

import { Module } from "../interface";
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

	input(channelsRaw?: string, ...words: Array<string>) {
		const channels = channelsRaw?.split(",");
		if (!channels) return;
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
