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
 * Clé localStorage paramètres "layout".
 */
export const STORAGE_SETTINGS_LAYOUT_KEY = "flex.settings.layout";

// ---- //
// Type //
// ---- //

export interface LayoutData
{
	channel_userlist_display?: boolean;
	channel_userlist_position?: "left" | "right";
	navigation_bar_position?: "left" | "right";
}

// -------- //
// Constant //
// -------- //

const POSITIONS: Array<string> = ["left", "right"];
const DEFAULT_CHANNEL_USERLIST_POSITION = "right" as const;
const DEFAULT_NAVIGATION_BAR_POSITION = "left" as const;
const DEFAULT_CHANNEL_USERLIST_DISPLAY = true;

// -------------- //
// Implémentation //
// -------------- //

export class LayoutStorage extends AppLocalStorage<LayoutData>
{
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_LAYOUT_KEY;

	static default(): LayoutData
	{
		return {
			channel_userlist_display: DEFAULT_CHANNEL_USERLIST_DISPLAY,
			channel_userlist_position: DEFAULT_CHANNEL_USERLIST_POSITION,
			navigation_bar_position: DEFAULT_NAVIGATION_BAR_POSITION,
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined
	{
		if (key !== "") {
			let keys = [
				"channel_userlist_display",
				"channel_userlist_position",
				"navigation_bar_position",
			];
			
			if (!keys.includes(key)) {
				return;
			}

			if (key === "channel_userlist_display" && !is_boolean(value)) {
				return DEFAULT_CHANNEL_USERLIST_DISPLAY;
			}

			if (key === "channel_userlist_position" && !POSITIONS.includes(value)) {
				return DEFAULT_CHANNEL_USERLIST_POSITION;
			}

			if (key === "navigation_bar_position" && !POSITIONS.includes(value)) {
				return DEFAULT_NAVIGATION_BAR_POSITION;
			}
		}

		if (value === undefined) {
			return LayoutStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor()
	{
		super(
			LayoutStorage.KEY,
			LayoutStorage.fromJSON,
			LayoutStorage.default(),
		);
	}

	persist()
	{
		this.set({
			channel_userlist_display: this.value.channel_userlist_display,
			channel_userlist_position: this.value.channel_userlist_position,
			navigation_bar_position: this.value.navigation_bar_position,
		});
	}
}
