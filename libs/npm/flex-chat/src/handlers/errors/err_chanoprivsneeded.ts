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

export class ErrorChanoprivsneededHandler
	implements SocketEventInterface<"ERR_CHANOPRIVSNEEDED">
{
	constructor(private store: ChatStoreInterface)
	{}

	listen()
	{
		this.store.on("ERR_CHANOPRIVSNEEDED", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_CHANOPRIVSNEEDED">)
	{
		let room = this.store.room_manager().get(data.channel, {
			state: "opened:not-kicked"
		})
			.or_else(() => this.store.network().into_some())
			.unwrap();

		room.add_event(
			"error:err_chanoprivsneeded",
			room.create_event(data),
			data.reason,
		);
	}
}
