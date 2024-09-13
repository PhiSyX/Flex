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

// ---- //
// Type //
// ---- //

type S = SocketEventInterface<"ERR_CANNOTKICKGLOBOPS">;

// -------------- //
// Implémentation //
// -------------- //

export class ErrorCannotkickglobopsHandler implements S {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStoreInterface) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("ERR_CANNOTKICKGLOBOPS", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_CANNOTKICKGLOBOPS">) {
		let room = this.store.room_manager().active();
		room.add_event(
			"error:err_cannotkickglobops",
			room.create_event(data),
			data.reason,
		);
	}
}
