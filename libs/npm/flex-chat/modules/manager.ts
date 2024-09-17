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
import type { CommandInterface, ModuleInterface } from "./interface";

export class ModuleManager {
	private _sets: Set<() => Promise<unknown>> = new Set();
	private _maps: Map<string, { listen(): void }> = new Map();

	get size() {
		return this._sets.size;
	}

	add(module: () => Promise<unknown>): Set<() => Promise<unknown>> {
		return this._sets.add(module);
	}

	extends(record: Record<string, () => Promise<unknown>>): this {
		for (let module_key in record) {
			this.add(record[module_key]);
		}
		return this;
	}

	get<T extends CommandsNames = CommandsNames>(
		module_id: T,
	): Option<ModuleInterface & CommandInterface<T>> {
		let maybe_module = this._maps.get(module_id) as
			| (ModuleInterface & CommandInterface<T>)
			| undefined;
		return Option.from(maybe_module);
	}

	get_unchecked<T extends CommandsNames = CommandsNames>(
		module_id: T,
	): (ModuleInterface & CommandInterface<T>) | undefined {
		let maybe_module = this._maps.get(module_id) as
			| (ModuleInterface & CommandInterface<T>)
			| undefined;
		return maybe_module;
	}

	set(module_id: string, module: ModuleInterface & CommandInterface) {
		return this._maps.set(module_id, module);
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
