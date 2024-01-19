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
import { JoinCommand } from "./command";
import { JoinHandler } from "./handler";
import { ReplyNamreplyHandler } from "./numeric";

// -------------- //
// Implémentation //
// -------------- //

export class JoinModule implements Module<JoinModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "JOIN";

	static create(store: ChatStore): JoinModule {
		return new JoinModule(
			new JoinCommand(store),
			new JoinHandler(store),
			new ReplyNamreplyHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: JoinCommand,
		private handler: JoinHandler,
		private numericNamreplyHandler: ReplyNamreplyHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelsRaw: string, keysRaw?: string) {
		const channels = channelsRaw.split(",");
		const keys = keysRaw?.split(",");
		console.log({ channels, keys });
		this.send({ channels, keys });
	}

	send(payload: Command<"JOIN">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
		this.numericNamreplyHandler.listen();
	}
}
