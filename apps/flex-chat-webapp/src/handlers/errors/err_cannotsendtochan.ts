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

export class ErrorCannotsendtochanHandler
	implements SocketEventInterface<"ERR_CANNOTSENDTOCHAN">
{
	constructor(private store: ChatStore) {}

	listen() {
		this.store.on("ERR_CANNOTSENDTOCHAN", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_CANNOTSENDTOCHAN">) {
		const room = this.store
			.roomManager()
			.get(data.channel_name, { state: "opened:not-kicked" })
			.or_else(() => Some(this.store.network()))
			.unwrap();
		room.addEvent(
			"error:err_cannotsendtochan",
			{ ...data, isCurrentClient: true },
			data.reason,
		);
	}
}
