// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Some } from "@phisyx/flex-safety";

import type { ChatStoreInterface } from "../../store";

// -------------- //
// Implémentation //
// -------------- //

export class InviteHandler implements SocketEventInterface<"INVITE">
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
		this.store.on("INVITE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"INVITE">)
	{
		let room = this.store
			.room_manager()
			.get(data.channel, { state: "opened:not-kicked" })
			.or_else(() =>
				Some(
					this.store
						.room_manager()
						.active({ state: "opened:not-kicked" }),
				),
			)
			.unwrap();

		room.add_event("event:invite", {
			...data,
			isCurrentClient: this.store.is_current_client(data.origin),
		});
	}
}
