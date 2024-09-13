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
 * Clé localStorage paramètres "private".
 */
export const STORAGE_SETTINGS_PRIVATE_KEY = "flex.settings.private";

// ---- //
// Type //
// ---- //

export interface PrivateData {
	waiting_list: boolean;
}

// -------- //
// Constant //
// -------- //

const DEFAULT_WAITING_LIST = true;

// -------------- //
// Implémentation //
// -------------- //

export class PrivateStorage extends AppLocalStorage<PrivateData> {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_PRIVATE_KEY;

	static default(): PrivateData {
		return {
			waiting_list: DEFAULT_WAITING_LIST,
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = ["waiting_list"];

			if (!keys.includes(key)) {
				return;
			}

			if (key === "waiting_list" && !is_boolean(value)) {
				return DEFAULT_WAITING_LIST;
			}
		}

		if (value === undefined) {
			return PrivateStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		super(
			PrivateStorage.KEY,
			PrivateStorage.fromJSON,
			PrivateStorage.default(),
		);
	}

	persist() {
		this.set({
			waiting_list: this.value.waiting_list,
		});
	}
}
