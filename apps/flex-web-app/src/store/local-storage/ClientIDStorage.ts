// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";
import { STORAGE_CLIENT_ID_KEY } from "./constant";

// -------------- //
// Implémentation //
// -------------- //

export class ClientIDStorage {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_CLIENT_ID_KEY;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		try {
			const clientID = localStorage.getItem(ClientIDStorage.KEY);
			this.clientID = Option.from(clientID);
		} catch {}
	}

	// --------- //
	// Propriété //
	// --------- //

	private clientID: Option<string> = None();

	// ------- //
	// Méthode //
	// ------- //

	maybe() {
		return this.clientID;
	}

	get() {
		return this.clientID.expect("ID du client stocké dans le localStorage");
	}

	set($1: string) {
		this.clientID.replace($1);

		try {
			localStorage.setItem(ClientIDStorage.KEY, this.toString());
		} catch {}
	}

	toString() {
		return this.clientID.unwrap();
	}
}
