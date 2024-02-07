// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Option } from "@phisyx/flex-safety";

export type HandlerID = Opaque<string, "HandlerID">;

export class HandlerManager {
	private _sets: Set<() => Promise<unknown>> = new Set();
	private _maps: Map<HandlerID, SocketEventHandler> = new Map();

	get size() {
		return this._sets.size;
	}

	add(module: () => Promise<unknown>): Set<() => Promise<unknown>> {
		return this._sets.add(module);
	}

	get<T extends CommandsNames = CommandsNames>(moduleID: T): Option<SocketEventHandler> {
		return Option.from(this._maps.get(moduleID as HandlerID) as SocketEventHandler | undefined);
	}

	set(moduleID: string, module: SocketEventHandler) {
		return this._maps.set(moduleID as HandlerID, module);
	}

	free() {
		this._sets.clear();
	}

	sets() {
		return this._sets;
	}

	handlers() {
		return this._maps;
	}
}
