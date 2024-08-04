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

import { JoinCommand, SajoinCommand } from "./command";
import { JoinHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class JoinModule implements Module<JoinModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "JOIN";

	static create(store: ChatStoreInterface): JoinModule
	{
		return new JoinModule(new JoinCommand(store), new JoinHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: JoinCommand,
		private handler: JoinHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, channels_raw?: ChannelID, keys_raw?: string)
	{
		let channels = channels_raw?.split(",") as Array<ChannelID>;
		if (!channels) {
			return;
		}
		let keys = keys_raw?.split(",");
		this.send({ channels, keys });
	}

	send(payload: Command<"JOIN">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}

export class SajoinModule implements Module<SajoinModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SAJOIN";

	static create(store: ChatStoreInterface): SajoinModule
	{
		return new SajoinModule(new SajoinCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SajoinCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(_: string, nicknames_raw?: string, channels_raw?: ChannelID)
	{
		let nicknames = nicknames_raw?.split(",");
		let channels = channels_raw?.split(",") as Array<ChannelID>;
		if (!nicknames || !channels) {
			return;
		}
		this.send({ nicknames, channels });
	}

	send(payload: Command<"SAJOIN">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}
