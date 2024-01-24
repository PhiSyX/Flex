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
import { PrivmsgCommand } from "./command";
import { PrivmsgHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PrivmsgModule implements Module<PrivmsgModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PRIVMSG";

	static create(store: ChatStore): PrivmsgModule {
		return new PrivmsgModule(
			new PrivmsgCommand(store),
			new PrivmsgHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PrivmsgCommand,
		private handler: PrivmsgHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(targetsRaw?: string, ...words: Array<string>) {
		const targets = targetsRaw?.split(",");
		if (!targets) return;
		const text = words.join(" ");
		this.send({ targets, text });
	}

	send(payload: Command<"PRIVMSG">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
