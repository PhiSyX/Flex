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

import type { ChatStore } from "~/storage/memory/chat";

// -------------- //
// Implémentation //
// -------------- //

export class ErrorChanoprivsneededHandler
	implements SocketEventInterface<"ERR_CHANOPRIVSNEEDED">
{
	constructor(private store: ChatStore) {}

	listen() {
		this.store.on("ERR_CHANOPRIVSNEEDED", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_CHANOPRIVSNEEDED">) {
		const channel = this.store
			.roomManager()
			.get(data.channel, { state: "opened:not-kicked" })
			.or_else(() => Some(this.store.network()))
			.unwrap();
		channel.addEvent(
			"error:err_chanoprivsneeded",
			{ ...data, isCurrentClient: true },
			data.reason,
		);
	}
}
