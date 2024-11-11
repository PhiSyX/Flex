// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { is_boolean, is_number } from "@phisyx/flex-asserts/primitive";

import { ALL_THEMES, type Theme } from "../theme";
import { AppLocalStorage } from "./storage";

/**
 * Clé localStorage paramètres "Personalization".
 */
export const STORAGE_SETTINGS_PERSONALIZATION_KEY =
	"flex.settings.personalization";

// ---- //
// Type //
// ---- //

export interface PersonalizationData {
	theme: keyof Theme;
	formats: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
	};
	colors: {
		background?: number | null;
		foreground?: number | null;
	};
}

// -------- //
// Constant //
// -------- //

const DEFAULT_THEME = "ice" as const;
const DEFAULT_FORMATS = {
	bold: false,
	italic: false,
	underline: false,
};
const DEFAULT_COLORS = {
	background: null,
	foreground: null,
};

const COLORS_KEYS = ["background", "foreground"];
const FORMATS_KEYS = ["bold", "italic", "underline"];

// -------------- //
// Implémentation //
// -------------- //

export class PersonalizationStorage extends AppLocalStorage<PersonalizationData> {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_PERSONALIZATION_KEY;

	static default(): PersonalizationData {
		return {
			theme: "ice",
			formats: DEFAULT_FORMATS,
			colors: DEFAULT_COLORS,
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = [
				"theme",
				"formats",
				"colors",
				...FORMATS_KEYS,
				...COLORS_KEYS,
			];

			if (!keys.includes(key)) {
				return;
			}

			if (key === "formats" && !value) {
				return DEFAULT_FORMATS;
			}

			if (key === "colors" && !value) {
				return DEFAULT_COLORS;
			}

			if (key === "theme" && !ALL_THEMES.includes(value)) {
				return DEFAULT_THEME;
			}

			if (
				COLORS_KEYS.includes(key) &&
				!(value === null || is_number(value))
			) {
				return null;
			}

			if (
				FORMATS_KEYS.includes(key) &&
				!(value === null || is_boolean(value))
			) {
				return null;
			}
		}

		if (value === undefined) {
			return PersonalizationStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		super(
			PersonalizationStorage.KEY,
			PersonalizationStorage.fromJSON,
			PersonalizationStorage.default(),
		);
	}

	persist() {
		this.set({
			theme: this.value.theme,
			colors: this.value.colors,
			formats: this.value.formats,
		});
	}
}
