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

export class ErrorBadchannelkeyHandler
	implements SocketEventInterface<"ERR_BADCHANNELKEY">
{
	constructor(private store: ChatStoreInterface)
	{}

	listen()
	{
		this.store.on("ERR_BADCHANNELKEY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_BADCHANNELKEY">)
	{
		let room = this.store.room_manager().get(data.channel, { state: "opened:not-kicked" })
			.or_else(() => Some(this.store.network()))
			.unwrap();

		room.add_event(
			"error:err_badchannelkey",
			{ ...data, isCurrentClient: true },
			data.reason,
		);
	}
}
