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
import { KickCommand } from "./command";
import { KickHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class KickModule implements Module<KickModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "KICK";

	static create(store: ChatStoreInterface): KickModule
	{
		return new KickModule(new KickCommand(store), new KickHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: KickCommand,
		private handler: KickHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(
		_: string,
		channels_raw?: ChannelID,
		knicks_raw?: string,
		...words: Array<string>
	) {
		let channels = channels_raw?.split(",");
		let knicks = knicks_raw?.split(",");
		if (!channels || !knicks) {
			return;
		}
		let comment = words.join(" ") || "Kick.";
		this.send({ channels, knicks, comment });
	}

	send(payload: Command<"KICK">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}
