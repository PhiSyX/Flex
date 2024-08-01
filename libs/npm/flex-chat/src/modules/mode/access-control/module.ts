// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Module } from "../../../modules/interface";
import type { ChatStoreInterface } from "../../../store";
import {
	BanCommand,
	BanExCommand,
	UnbanCommand,
	UnbanExCommand,
} from "./command";
import { ModeAccessControlHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class ModeAccessControlModule
	implements Module<ModeAccessControlModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "MODE_ACCESS_CONTROL";

	static create(store: ChatStoreInterface): ModeAccessControlModule {
		return new ModeAccessControlModule(new ModeAccessControlHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private handler: ModeAccessControlHandler) {}

	input() {}

	send() {}

	listen() {
		this.handler.listen();
	}
}

export class BanModule implements Module<BanModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "BAN";

	static create(store: ChatStoreInterface): BanModule {
		return new BanModule(new BanCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: BanCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		roomName?: string,
		channelsRaw?: ChannelID,
		...masksRaw: Array<string>
	) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"BAN">) {
		this.command.send(payload);
	}

	listen() {}
}

export class UnbanModule implements Module<UnbanModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "UNBAN";

	static create(store: ChatStoreInterface): UnbanModule {
		return new UnbanModule(new UnbanCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: UnbanCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		roomName?: string,
		channelsRaw?: ChannelID,
		...masksRaw: Array<string>
	) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"UNBAN">) {
		this.command.send(payload);
	}

	listen() {}
}

export class BanExModule implements Module<BanExModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "BANEX";

	static create(store: ChatStoreInterface): BanExModule {
		return new BanExModule(new BanExCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: BanExCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		roomName?: string,
		channelsRaw?: ChannelID,
		...masksRaw: Array<string>
	) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"BANEX">) {
		this.command.send(payload);
	}

	listen() {}
}

export class UnbanExModule implements Module<UnbanExModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "UNBANEX";

	static create(store: ChatStoreInterface): UnbanExModule {
		return new UnbanExModule(new UnbanExCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: UnbanExCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		roomName?: string,
		channelsRaw?: ChannelID,
		...masksRaw: Array<string>
	) {
		if (!roomName?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channelsRaw?.startsWith("#")) {
			const channels = channelsRaw?.split(",");
			if (!channels) return;
			const masks = masksRaw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		const channels = [roomName];
		if (channelsRaw) {
			masksRaw.unshift(channelsRaw);
		}
		const masks = masksRaw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"UNBANEX">) {
		this.command.send(payload);
	}

	listen() {}
}