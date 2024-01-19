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
import { PartCommand } from "./command";
import { PartHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PartModule implements Module<PartModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PART";

	static create(store: ChatStore): PartModule {
		return new PartModule(new PartCommand(store), new PartHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PartCommand,
		private handler: PartHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelsRaw: string) {
		const channels = channelsRaw.split(",");
		this.send({ channels });
	}

	send(payload: Command<"JOIN">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
