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
import { IgnoreCommand, UnignoreCommand } from "./command";
import { ReplyIgnoreHandler, ReplyUnignoreHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class IgnoreModule implements Module<IgnoreModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "IGNORE";

	static create(store: ChatStore): IgnoreModule {
		return new IgnoreModule(new IgnoreCommand(store), new ReplyIgnoreHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: IgnoreCommand,
		private numericIgnoreHandler: ReplyIgnoreHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(nickname?: string) {
		if (!nickname) return;
		this.send({ nickname });
	}

	send(payload: Command<"IGNORE">) {
		this.command.send(payload);
	}

	listen() {
		this.numericIgnoreHandler.listen();
	}
}

export class UnignoreModule implements Module<UnignoreModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "UNIGNORE";

	static create(store: ChatStore): UnignoreModule {
		return new UnignoreModule(new UnignoreCommand(store), new ReplyUnignoreHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: UnignoreCommand,
		private numericUnignoreHandler: ReplyUnignoreHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(nickname?: string) {
		if (!nickname) return;
		this.send({ nickname });
	}

	send(payload: Command<"UNIGNORE">) {
		this.command.send(payload);
	}

	listen() {
		this.numericUnignoreHandler.listen();
	}
}
