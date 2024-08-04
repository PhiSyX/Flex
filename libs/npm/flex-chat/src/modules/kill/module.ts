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
import { KillCommand } from "./command";
import { KillHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class KillModule implements Module<KillModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "KILL";

	static create(store: ChatStoreInterface): KillModule
	{
		return new KillModule(new KillCommand(store), new KillHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: KillCommand,
		private handler: KillHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, knick?: string, ...words: Array<string>)
	{
		let comment = words.join(" ");
		if (!knick || !comment) {
			return;
		}
		this.send({ nickname: knick, comment });
	}

	send(payload: Command<"KILL">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}
