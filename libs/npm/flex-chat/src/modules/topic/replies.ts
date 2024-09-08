// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStoreInterface } from "../../store";

import { assert_channel_room } from "../../asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyTopicHandler implements SocketEventInterface<"RPL_TOPIC">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("RPL_TOPIC", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_TOPIC">)
	{
		let maybe_channel = this.store.room_manager().get(data.channel);
		if (maybe_channel.is_none()) {
			return;
		}
		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);
		channel.set_topic(data.topic);

		// @ts-expect-error : type à corriger
		channel.add_event("event:topic", channel.create_event(
			data,
			this.store.is_current_client(data.origin)),
		);
	}
}

export class ReplyNotopicHandler implements SocketEventInterface<"RPL_NOTOPIC">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface)
	{}

	// ------- //
	// Méthode //
	// ------- //

	listen()
	{
		this.store.on("RPL_NOTOPIC", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_NOTOPIC">)
	{
		let maybe_channel = this.store.room_manager().get(data.channel);
		if (maybe_channel.is_none()) {
			return;
		}
		let channel = maybe_channel.unwrap();
		assert_channel_room(channel);
		channel.unset_topic();

		let event = channel.create_event(data);
		// @ts-expect-error - à corriger
		channel.add_event("event:no_topic", event);
	}
}
