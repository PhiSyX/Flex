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
	AccessLevelDEAOPCommand,
	AccessLevelDEHOPCommand,
	AccessLevelDEOPCommand,
	AccessLevelDEQOPCommand,
	AccessLevelDEVIPCommand,
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

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"QOP">) {
		this.command.send(payload);
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

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"AOP">) {
		this.command.send(payload);
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

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"OP">) {
		this.command.send(payload);
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

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"HOP">) {
		this.command.send(payload);
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

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"VIP">) {
		this.command.send(payload);
	}

	listen() {}
}

export class AccessLevelDEQOPModule implements Module<AccessLevelDEQOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEQOP";

	static create(store: ChatStore): AccessLevelDEQOPModule {
		return new AccessLevelDEQOPModule(new AccessLevelDEQOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEQOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"DEQOP">) {
		this.command.send(payload);
	}

	listen() {}
}

export class AccessLevelDEAOPModule implements Module<AccessLevelDEAOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEAOP";

	static create(store: ChatStore): AccessLevelDEAOPModule {
		return new AccessLevelDEAOPModule(new AccessLevelDEAOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEAOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"DEAOP">) {
		this.command.send(payload);
	}

	listen() {}
}

export class AccessLevelDEOPModule implements Module<AccessLevelDEOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEOP";

	static create(store: ChatStore): AccessLevelDEOPModule {
		return new AccessLevelDEOPModule(new AccessLevelDEOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"DEOP">) {
		this.command.send(payload);
	}

	listen() {}
}

export class AccessLevelDEHOPModule implements Module<AccessLevelDEHOPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEHOP";

	static create(store: ChatStore): AccessLevelDEHOPModule {
		return new AccessLevelDEHOPModule(new AccessLevelDEHOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEHOPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"DEHOP">) {
		this.command.send(payload);
	}

	listen() {}
}

export class AccessLevelDEVIPModule implements Module<AccessLevelDEVIPModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEVIP";

	static create(store: ChatStore): AccessLevelDEVIPModule {
		return new AccessLevelDEVIPModule(new AccessLevelDEVIPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEVIPCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(channelName?: string, nicknames_raw?: string) {
		if (!channelName || !nicknames_raw) return;
		const nicknames = nicknames_raw.split(",");
		this.send({ channel: channelName, nicknames });
	}

	send(payload: Command<"DEVIP">) {
		this.command.send(payload);
	}

	sendUnset(payload: Command<"DEVIP">) {
		this.command.send(payload);
	}

	listen() {}
}
