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
import { AwayCommand } from "./command";
import { ReplyAwayHandler, ReplyNowawayHandler, ReplyUnawayHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class AwayModule implements Module<AwayModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AWAY";

	static create(store: ChatStore): AwayModule {
		return new AwayModule(
			new AwayCommand(store),
			new ReplyAwayHandler(store),
			new ReplyNowawayHandler(store),
			new ReplyUnawayHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: AwayCommand,
		private numericAwayHandler: ReplyAwayHandler,
		private numericNowawayHandler: ReplyNowawayHandler,
		private numericUnawayHandler: ReplyUnawayHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, ...text: Array<string>) {
		this.send({ text: text.join(" ") });
	}

	send(payload: Command<"AWAY">) {
		this.command.send(payload);
	}

	listen() {
		this.numericAwayHandler.listen();
		this.numericNowawayHandler.listen();
		this.numericUnawayHandler.listen();
	}
}
