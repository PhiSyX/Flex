// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { AppLocalStorage } from "./storage";

/**
 * Clé localStorage paramètres "layout".
 */
export const STORAGE_SETTINGS_LAYOUT_KEY = "flex.settings.layout";

// ---- //
// Type //
// ---- //

export interface LayoutData {
	channelUserlistDisplay?: boolean;
	channelUserlistPosition?: "left" | "right";
	navigationBarPosition?: "left" | "right";
}

// -------------- //
// Implémentation //
// -------------- //

export class LayoutStorage extends AppLocalStorage<LayoutData> {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_LAYOUT_KEY;

	static default(): LayoutData {
		return {
			channelUserlistDisplay: true,
			channelUserlistPosition: "right",
			navigationBarPosition: "left",
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = [
				"channelUserlistDisplay",
				"channelUserlistPosition",
				"navigationBarPosition",
			];
			if (!keys.includes(key)) return;
			if (![true, false, "left", "right"].includes(value)) return;
		}

		if (value == null) {
			return LayoutStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		super(
			LayoutStorage.KEY,
			LayoutStorage.fromJSON,
			LayoutStorage.default(),
		);
	}
}
