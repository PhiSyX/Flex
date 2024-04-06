// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Err, Ok, type Result } from "@phisyx/flex-safety";
import type { ChatStore } from "~/store/ChatStore";

import type { AuthApiHTTPClient } from "./feign/api";
import { AuthSubCommand } from "./subcommand";

// -------------- //
// Implémentation //
// -------------- //

export class AuthCommand
{
	static from_str(value: string): Result<AuthSubCommand, Error>
	{
		switch(value) {
			case "id":
			case "ident":
			case "identify":
				return Ok(AuthSubCommand.IDENTIFY);

			case "reg":
			case "register":
				return Ok(AuthSubCommand.REGISTER);

			default:
				return Err(new Error(`La commande "${value}" n'est pas valide pour le module AUTH`));
		}
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore, private authApiHttpClient: AuthApiHTTPClient) {}

	sendIdentify(payload: AuthIdentifyFormData)
	{
		payload.remember_me ??= false;

		this.authApiHttpClient.identify(payload)
			.then((response) => this.store.emit("AUTH IDENTIFY", response));
	}

	sendRegister(payload: AuthRegisterFormData)
	{
		this.authApiHttpClient.register(payload)
			.then((response) => {
				this.store.roomManager().active()
					// FIXME: addEvent(response.code, ...)
					.addConnectEvent(
						{
							origin: this.store.client(),
							tags: { msgid: response.id }
						},
						`-AuthServ- ${response.message}`
					)
			})
	}
}
