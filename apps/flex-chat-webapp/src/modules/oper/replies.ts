// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChatStore } from "~/store/ChatStore";

export class ErrorNooperhostHandler implements SocketEventInterface<"ERR_NOOPERHOST"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("ERR_NOOPERHOST", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_NOOPERHOST">) {
		const currentRoom = this.store.roomManager().active();
		currentRoom.addEvent(
			"error:err_nooperhost",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}

export class ErrorPasswdmismatchHandler implements SocketEventInterface<"ERR_PASSWDMISMATCH"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("ERR_PASSWDMISMATCH", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_PASSWDMISMATCH">) {
		const currentRoom = this.store.roomManager().active();
		currentRoom.addEvent(
			"error:err_passwdmismatch",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}

export class ErrorOperonlyHandler implements SocketEventInterface<"ERR_OPERONLY"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("ERR_OPERONLY", (data) => this.handle(data));
	}

	handle(data: GenericReply<"ERR_OPERONLY">) {
		const currentRoom = this.store.roomManager().active();
		currentRoom.addEvent(
			"error:err_operonly",
			{ ...data, isCurrentClient: false },
			data.reason,
		);
	}
}
