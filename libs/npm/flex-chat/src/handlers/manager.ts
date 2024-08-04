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

export class HandlerManager
{
	// --------- //
	// Propriété //
	// --------- //

	private _sets: Set<() => Promise<unknown>> = new Set();
	private _maps: Map<string, SocketEventHandler> = new Map();
	
	// --------------- //
	// Getter | Setter //
	// --------------- //
	
	get size()
	{
		return this._sets.size;
	}

	// ------- //
	// Méthode //
	// ------- //

	add(module: () => Promise<unknown>): Set<() => Promise<unknown>>
	{
		return this._sets.add(module);
	}

	extends(record: Record<string, () => Promise<unknown>>): this
	{
		for (let module_key in record) {
			this.add(record[module_key]);
		}
		return this;
	}

	get<T extends CommandsNames = CommandsNames>(module_id: T): Option<SocketEventHandler>
	{
		return Option.from(
			this._maps.get(module_id) as SocketEventHandler | undefined,
		);
	}

	set(module_id: string, module: SocketEventHandler)
	{
		return this._maps.set(module_id, module);
	}

	free()
	{
		this._sets.clear();
	}

	sets()
	{
		return this._sets;
	}

	handlers()
	{
		return this._maps;
	}
}
