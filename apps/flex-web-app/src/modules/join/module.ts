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
import { JoinCommand, SajoinCommand } from "./command";
import { JoinHandler } from "./handler";

import { ErrorBadchannelkeyHandler } from "~/handlers/errors/ErrorBadchannelkeyHandler";
import { ReplyNamreplyHandler } from "~/handlers/replies/ReplyNamreplyHandler";

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
			new ErrorBadchannelkeyHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: JoinCommand,
		private handler: JoinHandler,
		private numericNamreplyHandler: ReplyNamreplyHandler,
		private numericErrorBadchannelkeyHandler: ErrorBadchannelkeyHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelsRaw?: string, keysRaw?: string) {
		const channels = channelsRaw?.split(",");
		if (!channels) return;
		const keys = keysRaw?.split(",");
		this.send({ channels, keys });
	}

	send(payload: Command<"JOIN">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
		this.numericNamreplyHandler.listen();
		this.numericErrorBadchannelkeyHandler.listen();
	}
}

export class SajoinModule implements Module<SajoinModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SAJOIN";

	static create(store: ChatStore): SajoinModule {
		return new SajoinModule(new SajoinCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SajoinCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(nicknamesRaw?: string, channelsRaw?: string) {
		const nicknames = nicknamesRaw?.split(",");
		const channels = channelsRaw?.split(",");
		if (!nicknames || !channels) return;
		this.send({ nicknames, channels });
	}

	send(payload: Command<"SAJOIN">) {
		this.command.send(payload);
	}

	listen() {}
}
