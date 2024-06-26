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

import { ModeCommand } from "./command";
import { ModeHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class ModeModule implements Module<ModeModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "MODE";

	static create(store: ChatStore): ModeModule {
		return new ModeModule(new ModeCommand(store), new ModeHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: ModeCommand,
		private handler: ModeHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	send(payload: Command<"MODE">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
