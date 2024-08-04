// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_channel } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";
import { TopicCommand } from "./command";

// -------------- //
// Implémentation //
// -------------- //

export class TopicModule implements Module<TopicModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "TOPIC";

	static create(store: ChatStoreInterface): TopicModule {
		return new TopicModule(new TopicCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: TopicCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channel_raw?: string, ...words: Array<string>)
	{
		let channel_r = channel_raw;

		if (channel_r) {
			if (!channel_r.startsWith("#") && room_id.startsWith("#")) {
				words.unshift(channel_r);
				channel_r = room_id;
			}
		} else if (room_id.startsWith("#")) {
			channel_r = room_id;
		}

		if (!is_channel(channel_r)) {
			return;
		}

		let topic = words.join(" ");
		this.send({ channel: channel_r, topic });
	}

	send(payload: Command<"TOPIC">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}
