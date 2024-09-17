// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { cast_to_room_id } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";

import { ClearCommand, ClearallCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class ClearModule implements Module<ClearModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "CLEAR";

	static create(store: ChatStoreInterface): ClearModule {
		return new ClearModule(new ClearCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: ClearCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, rooms_raw?: RoomID) {
		for (let room_name of rooms_raw?.split(",") || [room_id]) {
			this.command.handle(cast_to_room_id(room_name));
		}
	}

	send() {}

	listen() {}
}

export class ClearallModule implements Module<ClearallModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "CLEARALL";

	static create(store: ChatStoreInterface): ClearallModule {
		return new ClearallModule(new ClearallCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: ClearallCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {
		this.command.handle();
	}

	send() {}

	listen() {}
}
