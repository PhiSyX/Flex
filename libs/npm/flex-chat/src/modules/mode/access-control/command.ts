// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { CommandInterface } from "../../../modules/interface";
import type { ChatStoreInterface } from "../../../store";

// -------------- //
// Implémentation //
// -------------- //

export class BanCommand implements CommandInterface<"BAN"> {
	constructor(private store: ChatStoreInterface) {}

	send(payload: Command<"BAN">) {
		this.store.emit("BAN", payload);
	}
}

export class UnbanCommand implements CommandInterface<"UNBAN"> {
	constructor(private store: ChatStoreInterface) {}

	send(payload: Command<"UNBAN">) {
		this.store.emit("UNBAN", payload);
	}
}

export class BanExCommand implements CommandInterface<"BANEX"> {
	constructor(private store: ChatStoreInterface) {}

	send(payload: Command<"BANEX">) {
		this.store.emit("BANEX", payload);
	}
}

export class UnbanExCommand implements CommandInterface<"UNBANEX"> {
	constructor(private store: ChatStoreInterface) {}

	send(payload: Command<"UNBANEX">) {
		this.store.emit("UNBANEX", payload);
	}
}
