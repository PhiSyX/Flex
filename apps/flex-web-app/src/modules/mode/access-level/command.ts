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
import { CommandInterface } from "../../interface";

// -------------- //
// Implémentation //
// -------------- //

export class AccessLevelQOPCommand implements CommandInterface<"QOP"> {
	constructor(private store: ChatStore) {}

	send(_payload: Command<"QOP">): void {}

	sendSet(payload: Command<"QOP">): void {
		this.store.emit("QOP", payload);
	}

	sendUnset(payload: Command<"DEQOP">): void {
		this.store.emit("DEQOP", payload);
	}
}

export class AccessLevelAOPCommand implements CommandInterface<"AOP"> {
	constructor(private store: ChatStore) {}

	send(_payload: Command<"AOP">): void {}

	sendSet(payload: Command<"AOP">): void {
		this.store.emit("AOP", payload);
	}

	sendUnset(payload: Command<"DEAOP">): void {
		this.store.emit("DEAOP", payload);
	}
}

export class AccessLevelOPCommand implements CommandInterface<"OP"> {
	constructor(private store: ChatStore) {}

	send(_payload: Command<"OP">): void {}

	sendSet(payload: Command<"OP">): void {
		this.store.emit("OP", payload);
	}

	sendUnset(payload: Command<"DEOP">): void {
		this.store.emit("DEOP", payload);
	}
}

export class AccessLevelHOPCommand implements CommandInterface<"HOP"> {
	constructor(private store: ChatStore) {}

	send(_payload: Command<"HOP">): void {}

	sendSet(payload: Command<"HOP">): void {
		this.store.emit("HOP", payload);
	}

	sendUnset(payload: Command<"DEHOP">): void {
		this.store.emit("DEHOP", payload);
	}
}

export class AccessLevelVIPCommand implements CommandInterface<"VIP"> {
	constructor(private store: ChatStore) {}

	send(_payload: Command<"VIP">): void {}

	sendSet(payload: Command<"VIP">): void {
		this.store.emit("VIP", payload);
	}

	sendUnset(payload: Command<"DEVIP">): void {
		this.store.emit("DEVIP", payload);
	}
}
