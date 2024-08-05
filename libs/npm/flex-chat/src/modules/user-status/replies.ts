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

// -------------- //
// Implémentation //
// -------------- //

export class ReplyAwayHandler implements SocketEventInterface<"RPL_AWAY">
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
		this.store.on("RPL_AWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_AWAY">)
	{
		let maybe_room = this.store.room_manager().get(data.origin.id);
		if (maybe_room.is_none()) {
			return;
		}
		let room = maybe_room.unwrap();
		room.add_event("event:rpl_away", room.create_event(
			data,
			this.store.is_current_client(data.origin),
		));
	}
}

export class ReplyNowawayHandler implements SocketEventInterface<"RPL_NOWAWAY">
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
		this.store.on("RPL_NOWAWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_NOWAWAY">)
	{
		let room = this.store.network();
		room.add_connect_event(data, data.message.slice(1));
		let user = this.store.user_manager().find(this.store.client_id())
			.unwrap();
		user.marks_as_away();
	}
}

export class ReplyUnawayHandler implements SocketEventInterface<"RPL_UNAWAY">
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
		this.store.on("RPL_UNAWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_UNAWAY">)
	{
		let room = this.store.network();
		room.add_connect_event(data, data.message.slice(1));
		let user = this.store.user_manager().find(this.store.client_id())
			.unwrap();
		user.marks_as_no_longer_away();
	}
}
