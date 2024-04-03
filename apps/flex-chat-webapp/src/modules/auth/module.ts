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
import type { ChatStore } from "~/store/ChatStore";

import { AuthCommand } from "./command";
import { AuthSubCommand } from "./subcommand";

// -------------- //
// Implémentation //
// -------------- //

export class AuthModule implements Module<AuthModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AUTH";

	static create(store: ChatStore): AuthModule
	{
		return new AuthModule(new AuthCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AuthCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_roomName: RoomID, ...args: Array<string>)
	{
		const size = args.length;
		if (size < 1) return;

		// SAFETY(type): le type ne peut pas être `undefined`, grâce à la
		//               condition ci-haut.
		const subCommandStr = args.shift() as string;

		const maybeSubCommand = AuthCommand.from_str(subCommandStr);
		if (maybeSubCommand.is_err()) return;
		const subCommand = maybeSubCommand.unwrap();

		switch (subCommand) {
			case AuthSubCommand.IDENTIFY:
			{
				if (size < 3) return;
				const [identifier, password] = args;
				this.sendIdentify({ identifier, password });
			} break;
		}
	}

	sendIdentify(payload: Command<"AUTH IDENTIFY">)
	{
		this.command.sendIdentify(payload);
	}

	listen() {}
}
