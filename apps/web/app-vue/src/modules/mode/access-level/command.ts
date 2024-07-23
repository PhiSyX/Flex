// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { CommandInterface } from "~/modules/interface";
import type { ChatStore } from "~/store";

// -------------- //
// Implémentation //
// -------------- //

export class AccessLevelQOPCommand implements CommandInterface<"QOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"QOP">): void {
		this.store.emit("QOP", payload);
	}
}

export class AccessLevelAOPCommand implements CommandInterface<"AOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"AOP">): void {
		this.store.emit("AOP", payload);
	}
}

export class AccessLevelOPCommand implements CommandInterface<"OP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"OP">): void {
		this.store.emit("OP", payload);
	}
}

export class AccessLevelHOPCommand implements CommandInterface<"HOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"HOP">): void {
		this.store.emit("HOP", payload);
	}
}

export class AccessLevelVIPCommand implements CommandInterface<"VIP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"VIP">): void {
		this.store.emit("VIP", payload);
	}
}

export class AccessLevelDEQOPCommand implements CommandInterface<"DEQOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"DEQOP">): void {
		this.store.emit("DEQOP", payload);
	}
}

export class AccessLevelDEAOPCommand implements CommandInterface<"DEAOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"DEAOP">): void {
		this.store.emit("DEAOP", payload);
	}
}

export class AccessLevelDEOPCommand implements CommandInterface<"DEOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"DEOP">): void {
		this.store.emit("DEOP", payload);
	}
}

export class AccessLevelDEHOPCommand implements CommandInterface<"DEHOP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"DEHOP">): void {
		this.store.emit("DEHOP", payload);
	}
}

export class AccessLevelDEVIPCommand implements CommandInterface<"DEVIP"> {
	constructor(private store: ChatStore) {}

	send(payload: Command<"DEVIP">): void {
		this.store.emit("DEVIP", payload);
	}
}
