// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	ChatStoreUUIDExt,
} from "../../store";
import type { Module } from "../interface";
import { AuthCommand } from "./command";
import { AuthApiHTTPClient } from "./feign/api";
import UpgradeUserHandler from "./handler";
import { AuthSubCommand } from "./subcommand";

// -------------- //
// Implémentation //
// -------------- //

export class AuthModule implements Module<AuthModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AUTH";

	static create(
		store: ChatStoreInterface & ChatStoreInterfaceExt & ChatStoreUUIDExt,
	): AuthModule {
		return new AuthModule(
			new AuthCommand(store, new AuthApiHTTPClient()),
			new UpgradeUserHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: AuthCommand,
		private upgrade_user_handler: UpgradeUserHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(_room_id: RoomID, ...args: Array<string>) {
		let size = args.length;
		if (size < 1) {
			return;
		}

		// SAFETY(type): le type ne peut pas être `undefined`, grâce à la
		//               condition ci-haut.
		let sub_command_str = args.shift()?.toLowerCase() as string;

		let maybe_sub_command = AuthCommand.from_str(sub_command_str);
		if (maybe_sub_command.is_err()) {
			return;
		}
		let sub_command = maybe_sub_command.unwrap();

		switch (sub_command) {
			case AuthSubCommand.IDENTIFY:
				{
					if (size < 3) {
						return;
					}

					let [identifier, password] = args;
					this.command.send_identify({ identifier, password });
				}
				break;

			case AuthSubCommand.REGISTER:
				{
					if (size < 4) {
						return;
					}

					let [username, password, email_address] = args;
					this.command.send_register({
						username,
						email_address,
						password,
						password_confirmation: password,
					});
				}
				break;
		}
	}

	listen() {
		this.upgrade_user_handler.listen();
	}
}
