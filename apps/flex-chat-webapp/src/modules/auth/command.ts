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

			default:
				return Err(new Error(`La commande "${value}" n'est pas valide pour le module AUTH`));
		}
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	sendIdentify(payload: Command<"AUTH IDENTIFY">)
	{
		payload.remember_me ??= false;

		const fetchOpts: RequestInit = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "same-origin",
			body: JSON.stringify(payload),
		};

		fetch("/api/v1/auth", fetchOpts)
			.then((response) => {
				if (response.ok) return response.json();
				return Promise.reject(response);
			})
			.then((payload) => this.store.emit("AUTH IDENTIFY", payload));
	}
}
