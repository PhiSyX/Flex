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

import { channelID, channelsID, isChannel } from "@phisyx/flex-chat";
import { PartCommand, SapartCommand } from "./command";
import { PartHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PartModule implements Module<PartModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PART";

	static create(store: ChatStore): PartModule {
		return new PartModule(new PartCommand(store), new PartHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PartCommand,
		private handler: PartHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(roomName: RoomID, channelsRaw?: ChannelID, ...words: Array<string>) {
		let channelsR = channelsRaw;

		if (channelsR) {
			if (!channelsR.startsWith("#") && roomName.startsWith("#")) {
				words.unshift(channelsR);
				channelsR = channelID(roomName);
			}
		} else if (roomName.startsWith("#")) {
			channelsR = channelID(roomName);
		}

		if (!isChannel(channelsR)) return;

		const chans = channelsID(channelsR.split(","));
		const message = words.join(" ");
		this.send({ channels: chans, message });
	}

	send(payload: Command<"PART">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}

export class SapartModule implements Module<SapartModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SAPART";

	static create(store: ChatStore): SapartModule {
		return new SapartModule(new SapartCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SapartCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		_: string,
		nicknamesRaw?: string,
		channelsRaw?: ChannelID,
		...messages: Array<string>
	) {
		const nicknames = nicknamesRaw?.split(",");
		const chans = channelsID(channelsRaw?.split(","));
		if (!nicknames || !chans) return;
		const message = messages.join(" ");
		this.send({ nicknames, channels: chans, message });
	}

	send(payload: Command<"SAPART">) {
		this.command.send(payload);
	}

	listen() {}
}
