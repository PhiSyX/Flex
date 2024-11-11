// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_boolean } from "@phisyx/flex-asserts/primitive";
import { AppLocalStorage } from "./storage";

/**
 * Clé localStorage paramètres "notification".
 */
export const STORAGE_SETTINGS_NOTIFICATION_KEY = "flex.settings.notification";

// ---- //
// Type //
// ---- //

export interface NotificationData {
	sounds: {
		enabled?: boolean;
		connection?: boolean;
		invites?: boolean;
		mentions?: boolean;
		notices?: boolean;
		queries?: boolean;
	};
}

// -------- //
// Constant //
// -------- //

const DEFAULT_SOUNDS: NotificationData["sounds"] = {
	enabled: true,
	connection: true,
	invites: true,
	mentions: true,
	notices: true,
	queries: true,
};
const DEFAULT_SOUNDS_KEYS: Array<keyof NotificationData["sounds"] | string> = [
	"enabled",
	"connection",
	"invites",
	"mentions",
	"notices",
	"queries",
];

// -------------- //
// Implémentation //
// -------------- //

export class NotificationStorage extends AppLocalStorage<NotificationData> {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_NOTIFICATION_KEY;

	static default(): NotificationData {
		return {
			sounds: DEFAULT_SOUNDS,
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = ["sounds", ...DEFAULT_SOUNDS_KEYS];

			if (!keys.includes(key)) {
				return;
			}

			if (DEFAULT_SOUNDS_KEYS.includes(key) && !is_boolean(value)) {
				return;
			}
		}

		if (value === undefined) {
			return NotificationStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		super(
			NotificationStorage.KEY,
			NotificationStorage.fromJSON,
			NotificationStorage.default(),
		);
	}

	persist() {
		this.set({ sounds: this.value.sounds });
	}
}
