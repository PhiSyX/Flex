// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface, ChatStoreInterfaceExt } from "../../store";
import type { Module } from "../interface";

import { PubmsgCommand } from "./command";
import { PubmsgHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PubmsgModule implements Module<PubmsgModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PUBMSG";

	static create(
		store: ChatStoreInterface & ChatStoreInterfaceExt,
	): PubmsgModule {
		return new PubmsgModule(
			new PubmsgCommand(store),
			new PubmsgHandler(store),
		);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PubmsgCommand,
		private handler: PubmsgHandler,
	) {}

	// ------- //
	// Méthode //
	// ------- //

	input(
		room_id: RoomID,
		formats: Commands["PUBMSG"]["formats"],
		colors: Commands["PUBMSG"]["colors"],
		channels_raw?: ChannelID,
		...words: Array<string>
	) {
		if (!room_id.startsWith("#")) {
			let channels = channels_raw?.split(",") as
				| Array<ChannelID>
				| undefined;
			if (!channels) {
				return;
			}
			let text = words.join(" ");
			this.send({ formats, colors, channels, text });
			return;
		}

		if (channels_raw?.startsWith("#")) {
			let channels = channels_raw?.split(",") as
				| Array<ChannelID>
				| undefined;
			if (!channels) {
				return;
			}
			let text = words.join(" ");
			this.send({ formats, colors, channels, text });
			return;
		}

		let channels = [room_id] as Array<ChannelID>;
		if (channels_raw) {
			words.unshift(channels_raw);
		}
		let text = words.join(" ");
		this.send({ formats, colors, channels, text });
	}

	send(payload: Command<"PUBMSG">) {
		this.command.send(payload);
	}

	listen() {
		this.handler.listen();
	}
}
