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
	InviteExCommand,
	UnbanCommand,
	UnbanExCommand,
	UninviteExCommand,
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
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
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
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
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
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
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
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"UNBANEX">) {
		this.command.send(payload);
	}

	listen() {}
}

export class InviteExModule implements Module<InviteExModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "INVITEX";

	static create(store: ChatStoreInterface): InviteExModule {
		return new InviteExModule(new InviteExCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: InviteExCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"INVITEX">) {
		this.command.send(payload);
	}

	listen() {}
}

export class UninviteExModule implements Module<UninviteExModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "UNINVITEX";

	static create(store: ChatStoreInterface): UninviteExModule {
		return new UninviteExModule(new UninviteExCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: UninviteExCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		room_id?: RoomID,
		channels_raw?: ChannelID,
		...masks_raw: Array<string>
	) {
		if (!room_id?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",");
			if (!channels) {
				return;
			}
			let masks = masks_raw as Array<MaskAddr>;
			this.send({ channels, masks });
			return;
		}

		let channels = [room_id];
		if (channels_raw) {
			masks_raw.unshift(channels_raw);
		}
		let masks = masks_raw as Array<MaskAddr>;
		this.send({ channels, masks });
	}

	send(payload: Command<"UNINVITEX">) {
		this.command.send(payload);
	}

	listen() {}
}
