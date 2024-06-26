// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStore } from "~/storage/memory/chat";

import { assertPrivateRoom } from "~/asserts/room";

// -------------- //
// Implémentation //
// -------------- //

export class ReplyAwayHandler implements SocketEventInterface<"RPL_AWAY"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_AWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_AWAY">) {
		const maybePriv = this.store.roomManager().get(data.origin.id);
		if (maybePriv.is_none()) return;
		const priv = maybePriv.unwrap();
		assertPrivateRoom(priv);
		priv.addEvent("event:rpl_away", {
			...data,
			isCurrentClient: this.store.isCurrentClient(data.origin),
		});
	}
}

export class ReplyNowawayHandler
	implements SocketEventInterface<"RPL_NOWAWAY">
{
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_NOWAWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_NOWAWAY">) {
		const room = this.store.network();
		room.addConnectEvent(data, data.message.slice(1));
		const user = this.store
			.userManager()
			.find(this.store.clientID())
			.unwrap();
		user.marksAsAway();
	}
}

export class ReplyUnawayHandler implements SocketEventInterface<"RPL_UNAWAY"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_UNAWAY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_UNAWAY">) {
		const room = this.store.network();
		room.addConnectEvent(data, data.message.slice(1));
		const user = this.store
			.userManager()
			.find(this.store.clientID())
			.unwrap();
		user.marksAsNoLongerAway();
	}
}
