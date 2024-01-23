// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";

import { Module } from "../../interface";
import {
	AccessLevelAOPCommand,
	AccessLevelHOPCommand,
	AccessLevelOPCommand,
	AccessLevelQOPCommand,
	AccessLevelVIPCommand,
} from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class AccessLevelQOPModule implements Module<AccessLevelQOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "QOP";

	static create(store: ChatStore): AccessLevelQOPModule {
		return new AccessLevelQOPModule(new AccessLevelQOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelQOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	sendSet(payload: Command<"QOP">) {
		this.command.sendSet(payload);
	}

	sendUnset(payload: Command<"DEQOP">) {
		this.command.sendUnset(payload);
	}

	listen() {}
}

export class AccessLevelAOPModule implements Module<AccessLevelAOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AOP";

	static create(store: ChatStore): AccessLevelAOPModule {
		return new AccessLevelAOPModule(new AccessLevelAOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelAOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	sendSet(payload: Command<"AOP">) {
		this.command.sendSet(payload);
	}

	sendUnset(payload: Command<"DEAOP">) {
		this.command.sendUnset(payload);
	}

	listen() {}
}

export class AccessLevelOPModule implements Module<AccessLevelOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "OP";

	static create(store: ChatStore): AccessLevelOPModule {
		return new AccessLevelOPModule(new AccessLevelOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	sendSet(payload: Command<"OP">) {
		this.command.sendSet(payload);
	}

	sendUnset(payload: Command<"DEOP">) {
		this.command.sendUnset(payload);
	}

	listen() {}
}

export class AccessLevelHOPModule implements Module<AccessLevelHOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "HOP";

	static create(store: ChatStore): AccessLevelHOPModule {
		return new AccessLevelHOPModule(new AccessLevelHOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelHOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	sendSet(payload: Command<"HOP">) {
		this.command.sendSet(payload);
	}

	sendUnset(payload: Command<"DEHOP">) {
		this.command.sendUnset(payload);
	}

	listen() {}
}

export class AccessLevelVIPModule implements Module<AccessLevelVIPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "VIP";

	static create(store: ChatStore): AccessLevelVIPModule {
		return new AccessLevelVIPModule(new AccessLevelVIPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelVIPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input() {}

	sendSet(payload: Command<"VIP">) {
		this.command.sendSet(payload);
	}

	sendUnset(payload: Command<"DEVIP">) {
		this.command.sendUnset(payload);
	}

	listen() {}
}
