// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";
import { NoticeCommand } from "./command";
import { NoticeHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class NoticeModule implements Module<NoticeModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "NOTICE";

	static create(store: ChatStoreInterface): NoticeModule {
		return new NoticeModule(
			new NoticeCommand(store),
			new NoticeHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: NoticeCommand,
		private handler: NoticeHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, targets_raw?: string, ...words: Array<string>) {
		let targets: Array<string> = targets_raw?.split(",") || [];
		let text = words.join(" ");
		this.send({ targets, text });
	}

	send(payload: Command<"NOTICE">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
