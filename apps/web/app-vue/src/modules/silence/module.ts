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

import { SilenceCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class SilenceModule implements Module<SilenceModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SILENCE";

	static create(store: ChatStore): SilenceModule {
		return new SilenceModule(new SilenceCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SilenceCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, nickname?: string) {
		if (
			!nickname ||
			(!nickname.startsWith("-") && !nickname.startsWith("+"))
		) {
			return;
		}

		this.send({ nickname });
	}

	send(payload: Command<"SILENCE">) {
		this.command.send(payload);
	}

	listen() {}
}
