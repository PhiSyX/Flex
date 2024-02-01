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
import { SilenceCommand } from "./command";
import { ReplySilenceHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class SilenceModule implements Module<SilenceModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SILENCE";

	static create(store: ChatStore): SilenceModule {
		return new SilenceModule(new SilenceCommand(store), new ReplySilenceHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: SilenceCommand,
		private numericSilenceHandler: ReplySilenceHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(nickname?: string) {
		if (!nickname || (!nickname.startsWith("-") && !nickname.startsWith("+"))) {
			return;
		}

		console.log(2, { nickname });

		this.send({ nickname });
	}

	send(payload: Command<"SILENCE">) {
		this.command.send(payload);
	}

	listen() {
		this.numericSilenceHandler.listen();
	}
}
