// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_boolean } from "@phisyx/flex-asserts";
import { AppLocalStorage } from "./storage";

/**
 * Clé localStorage "Se souvenir de moi".
 */
export const STORAGE_REMEMBER_ME_KEY = "flex.remember_me";

// -------------- //
// Implémentation //
// -------------- //

export class RememberMeStorage extends AppLocalStorage<boolean>
{
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_REMEMBER_ME_KEY;

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): boolean | undefined
	{
		if (!(key.length === 0 && is_boolean(value))) {
			return;
		}
		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor()
	{
		super(RememberMeStorage.KEY, RememberMeStorage.fromJSON);
	}

	// -------- //
	// Override //
	// -------- //

	override get()
	{
		return this.item.unwrap_or(false);
	}
}
