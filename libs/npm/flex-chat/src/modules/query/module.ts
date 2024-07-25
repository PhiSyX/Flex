// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { roomID } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";
import { QueryCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class QueryModule implements Module<QueryModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "QUERY";

	static create(store: ChatStoreInterface): QueryModule {
		return new QueryModule(new QueryCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: QueryCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(__: string, nicknamesRaw?: RoomID) {
		for (const nickname of nicknamesRaw?.split(",") || []) {
			this.command.handle(roomID(nickname));
		}
	}

	send() {}

	listen() {}
}
