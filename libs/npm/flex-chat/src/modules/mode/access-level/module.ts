// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_channel } from "../../../asserts/room";
import type { ChatStoreInterface } from "../../../store";
import type { Module } from "../../interface";
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
import { ModeAccessLevelHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class ModeAccessLevelModule implements Module<ModeAccessLevelModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "MODE_ACCESS_LEVEL";

	static create(store: ChatStoreInterface): ModeAccessLevelModule {
		return new ModeAccessLevelModule(new ModeAccessLevelHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private handler: ModeAccessLevelHandler)
	{}

	input()
	{}

	send()
	{}

	listen()
	{
		this.handler.listen();
	}
}

export class AccessLevelQOPModule implements Module<AccessLevelQOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "QOP";

	static create(store: ChatStoreInterface): AccessLevelQOPModule {
		return new AccessLevelQOPModule(new AccessLevelQOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelQOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"QOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelAOPModule implements Module<AccessLevelAOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "AOP";

	static create(store: ChatStoreInterface): AccessLevelAOPModule {
		return new AccessLevelAOPModule(new AccessLevelAOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelAOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"AOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelOPModule implements Module<AccessLevelOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "OP";

	static create(store: ChatStoreInterface): AccessLevelOPModule {
		return new AccessLevelOPModule(new AccessLevelOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"OP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelHOPModule implements Module<AccessLevelHOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "HOP";

	static create(store: ChatStoreInterface): AccessLevelHOPModule {
		return new AccessLevelHOPModule(new AccessLevelHOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelHOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"HOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelVIPModule implements Module<AccessLevelVIPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "VIP";

	static create(store: ChatStoreInterface): AccessLevelVIPModule {
		return new AccessLevelVIPModule(new AccessLevelVIPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelVIPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"VIP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelDEQOPModule implements Module<AccessLevelDEQOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEQOP";

	static create(store: ChatStoreInterface): AccessLevelDEQOPModule {
		return new AccessLevelDEQOPModule(new AccessLevelDEQOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEQOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"DEQOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelDEAOPModule implements Module<AccessLevelDEAOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEAOP";

	static create(store: ChatStoreInterface): AccessLevelDEAOPModule {
		return new AccessLevelDEAOPModule(new AccessLevelDEAOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEAOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"DEAOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelDEOPModule implements Module<AccessLevelDEOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEOP";

	static create(store: ChatStoreInterface): AccessLevelDEOPModule {
		return new AccessLevelDEOPModule(new AccessLevelDEOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"DEOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelDEHOPModule implements Module<AccessLevelDEHOPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEHOP";

	static create(store: ChatStoreInterface): AccessLevelDEHOPModule {
		return new AccessLevelDEHOPModule(new AccessLevelDEHOPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEHOPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"DEHOP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}

export class AccessLevelDEVIPModule implements Module<AccessLevelDEVIPModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "DEVIP";

	static create(store: ChatStoreInterface): AccessLevelDEVIPModule {
		return new AccessLevelDEVIPModule(new AccessLevelDEVIPCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: AccessLevelDEVIPCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_name_raw?: string, nicknames_raw?: string)
	{
		let channel = channel_name_raw;
		let nicknames_r = nicknames_raw;

		if (channel_name_raw && !nicknames_raw) {
			if (channel_name_raw.startsWith("#") && !room_id.startsWith("#")) {
				return;
			}
			nicknames_r = channel_name_raw;
			channel = room_id;
		}

		if (!channel || !nicknames_r || !is_channel(channel)) {
			return;
		}
		let nicknames = nicknames_r.split(",");
		this.send({ channel, nicknames });
	}

	send(payload: Command<"DEVIP">)
	{
		this.command.send(payload);
	}

	send_unset(payload: Command<"DEVIP">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}
