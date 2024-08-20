// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";
import type { Module } from "../interface";
import { PrivmsgCommand } from "./command";
import { PrivmsgHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PrivmsgModule implements Module<PrivmsgModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PRIVMSG";

	static create(store: ChatStoreInterface & ChatStoreInterfaceExt): PrivmsgModule 
	{
		return new PrivmsgModule(
			new PrivmsgCommand(store),
			new PrivmsgHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PrivmsgCommand,
		private handler: PrivmsgHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(
		room_id: RoomID,
		formats: Commands["PRIVMSG"]["formats"],
		colors: Commands["PRIVMSG"]["colors"],
		targets_raw?: string,
		...words: Array<string>
	)
	{
		if (room_id.startsWith("#")) {
			let targets = targets_raw?.split(",");
			if (!targets) {
				return;
			}
			let text = words.join(" ");
			this.send({ formats, colors, targets, text });
			return;
		}

		let targets = [room_id];
		let text = [targets_raw, ...words].join(" ");
		this.send({ formats, colors, targets, text });
	}

	send(payload: Command<"PRIVMSG">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}
