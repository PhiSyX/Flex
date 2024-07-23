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
import type { ChatStore } from "~/store";

import { isChannel } from "@phisyx/flex-chat";
import { TopicCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class TopicModule implements Module<TopicModule> {
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "TOPIC";

	static create(store: ChatStore): TopicModule {
		return new TopicModule(new TopicCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: TopicCommand) {}

	// ------- //
	// Méthode //
	// ------- //

	input(roomName: RoomID, channelRaw?: string, ...words: Array<string>) {
		let channelR = channelRaw;

		if (channelR) {
			if (!channelR.startsWith("#") && roomName.startsWith("#")) {
				words.unshift(channelR);
				channelR = roomName;
			}
		} else if (roomName.startsWith("#")) {
			channelR = roomName;
		}

		if (!isChannel(channelR)) return;

		const topic = words.join(" ");
		this.send({ channel: channelR, topic });
	}

	send(payload: Command<"TOPIC">) {
		this.command.send(payload);
	}

	listen() {}
}
