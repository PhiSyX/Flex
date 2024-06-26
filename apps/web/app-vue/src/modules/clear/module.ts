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
import type { ChatStore } from "~/storage/memory/chat";

import { roomID } from "~/asserts/room";
import { ClearCommand, ClearallCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class ClearModule implements Module<ClearModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "CLEAR";

	static create(store: ChatStore): ClearModule {
		return new ClearModule(new ClearCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: ClearCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(activeRoomName: RoomID, roomsRaw?: RoomID) {
		for (const roomName of roomsRaw?.split(",") || [activeRoomName]) {
			this.command.handle(roomID(roomName));
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

	static create(store: ChatStore): ClearallModule {
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
