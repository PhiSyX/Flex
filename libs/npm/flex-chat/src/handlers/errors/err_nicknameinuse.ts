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

export class ErrorNicknameinuseHandler
	implements SocketEventInterface<"ERR_NICKNAMEINUSE">
{
	constructor(private store: ChatStoreInterface) {}

	listen() {
		this.store.on("ERR_NICKNAMEINUSE", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_NICKNAMEINUSE">) {
		if (!this.store.is_connected()) {
			if (
				data.nickname ===
				this.store.get_connect_user_info().alternative_nickname
			) {
				this.store.off("ERR_NICKNAMEINUSE");
			} else {
				this.store.emit("NICK (unregistered)", {
					nickname:
						this.store.get_connect_user_info().alternative_nickname,
				});
			}
			return;
		}

		console.debug("ERR_NICKNAMEINUSE", { data });
	}
}
