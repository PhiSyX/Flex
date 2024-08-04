// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Theme } from "../theme";
import { AppLocalStorage } from "./storage";

/**
 * Clé localStorage paramètres "Personalization".
 */
export const STORAGE_SETTINGS_PERSONALIZATION_KEY = "flex.settings.personalization";

// ---- //
// Type //
// ---- //

export interface PersonalizationData
{
	theme?: keyof Theme;
}

// -------------- //
// Implémentation //
// -------------- //

export class PersonalizationStorage extends AppLocalStorage<PersonalizationData>
{
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_PERSONALIZATION_KEY;

	static default(): PersonalizationData
	{
		return {
			theme: "ice",
		};
	}

	/**
	 * Validation du JSON
	 */
	static fromJSON(key: string, value: string): unknown | undefined
	{
		if (key !== "") {
			let keys = ["theme"];

			if (!keys.includes(key)) {
				return;
			}

			if (!["dark", "ice", "light", "system"].includes(value)) {
				return;
			}
		}

		if (value == null) {
			return PersonalizationStorage.default();
		}

		return value;
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor()
	{
		super(
			PersonalizationStorage.KEY,
			PersonalizationStorage.fromJSON,
			PersonalizationStorage.default(),
		);
	}
}
