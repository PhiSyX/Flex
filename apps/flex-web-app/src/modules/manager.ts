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
import { CommandInterface, ModuleInterface } from "./interface";

export type ModuleID = Opaque<string, "ModuleID">;

export class ModuleManager {
	private _sets: Set<() => Promise<unknown>> = new Set();
	private _maps: Map<ModuleID, { listen(): void }> = new Map();

	get size() {
		return this._sets.size;
	}

	add(module: () => Promise<unknown>): Set<() => Promise<unknown>> {
		return this._sets.add(module);
	}

	extends(it: Iterable<[string, () => Promise<unknown>]>): this {
		for (const [_, module] of it) {
			this.add(module);
		}
		return this;
	}

	get<T extends CommandsNames = CommandsNames>(
		moduleID: T,
	): Option<ModuleInterface & CommandInterface<T>> {
		return Option.from(
			this._maps.get(moduleID as ModuleID) as
				| (ModuleInterface & CommandInterface<T>)
				| undefined,
		);
	}

	set(moduleID: string, module: ModuleInterface & CommandInterface) {
		return this._maps.set(moduleID as ModuleID, module);
	}

	free() {
		this._sets.clear();
	}

	sets() {
		return this._sets;
	}

	modules() {
		return this._maps;
	}
}
