// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { cast_to_channel_id, cast_to_channels_id, is_channel } from "../../asserts/room";
import type { ChatStoreInterface } from "../../store";
import type { Module } from "../interface";
import { PartCommand, SapartCommand } from "./command";
import { PartHandler } from "./handler";

// -------------- //
// Implémentation //
// -------------- //

export class PartModule implements Module<PartModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "PART";

	static create(store: ChatStoreInterface): PartModule {
		return new PartModule(new PartCommand(store), new PartHandler(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(
		private command: PartCommand,
		private handler: PartHandler,
	)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(room_id: RoomID, channels_raw?: ChannelID, ...words: Array<string>)
	{
		let channels_r = channels_raw;

		if (channels_r) {
			if (!channels_r.startsWith("#") && room_id.startsWith("#")) {
				words.unshift(channels_r);
				channels_r = cast_to_channel_id(room_id);
			}
		} else if (room_id.startsWith("#")) {
			channels_r = cast_to_channel_id(room_id);
		}

		if (!is_channel(channels_r)) return;

		let chans = cast_to_channels_id(channels_r.split(","));
		let message = words.join(" ");
		this.send({ channels: chans, message });
	}

	send(payload: Command<"PART">)
	{
		this.command.send(payload);
	}

	listen()
	{
		this.handler.listen();
	}
}

export class SapartModule implements Module<SapartModule>
{
	// ------ //
	// STATIC //
	// ------ //

	static NAME = "SAPART";

	static create(store: ChatStoreInterface): SapartModule {
		return new SapartModule(new SapartCommand(store));
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private command: SapartCommand)
	{}

	// ------- //
	// Méthode //
	// ------- //

	input(
		_: string,
		nicknames_raw?: string,
		channels_raw?: ChannelID,
		...messages: Array<string>
	) {
		let nicknames = nicknames_raw?.split(",");
		let chans = cast_to_channels_id(channels_raw?.split(","));
		if (!nicknames || !chans) return;
		let message = messages.join(" ");
		this.send({ nicknames, channels: chans, message });
	}

	send(payload: Command<"SAPART">)
	{
		this.command.send(payload);
	}

	listen()
	{}
}
