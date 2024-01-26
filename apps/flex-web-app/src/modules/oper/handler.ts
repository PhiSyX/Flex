// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ChatStore } from "~/store/ChatStore";
import { User } from "~/user/User";

// -------------- //
// Implémentation //
// -------------- //

export class OperHandler implements SocketEventInterface<"RPL_YOUREOPER"> {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private store: ChatStore) {}

	// ------- //
	// Méthode //
	// ------- //

	listen() {
		this.store.on("RPL_YOUREOPER", (data) => this.handle(data));
	}

	handle(data: GenericReply<"RPL_YOUREOPER">) {
		this.store.upgradeUser(new User(data.origin).withOperatorFlag(data.oper_type));

		const currentRoom = this.store.roomManager().current();
		currentRoom.addEvent("event:rpl_youreoper", { ...data, isMe: true }, data.message.slice(1));
	}
}

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
		const currentRoom = this.store.roomManager().current();
		currentRoom.addEvent("error:err_nooperhost", { ...data, isMe: false }, data.reason);
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
		const currentRoom = this.store.roomManager().current();
		currentRoom.addEvent("error:err_passwdmismatch", { ...data, isMe: false }, data.reason);
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
		const currentRoom = this.store.roomManager().current();
		currentRoom.addEvent("error:err_operonly", { ...data, isMe: false }, data.reason);
	}
}
