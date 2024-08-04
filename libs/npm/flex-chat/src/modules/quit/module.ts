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
import { QuitCommand } from "./command";
import { QuitHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class QuitModule implements Module<QuitModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "QUIT";

	static create(store: ChatStoreInterface): QuitModule {
		return new QuitModule(new QuitCommand(store), new QuitHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: QuitCommand,
		private handler: QuitHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, ...words: Array<string>)
	{
		this.send({ reason: words.join(" ") });
	}

	send(payload: Command<"QUIT">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}
