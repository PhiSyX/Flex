// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Theme } from "~/theme";

import { STORAGE_SETTINGS_PERSONALIZATION_KEY } from "./constant";

// ---- //
// Type //
// ---- //

export interface PersonalizationData {
	theme?: keyof Theme;
}

// -------------- //
// Implémentation //
// -------------- //

export class PersonalizationStorage {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_PERSONALIZATION_KEY;

	static default(): PersonalizationData {
		return {
			theme: "ice",
		};
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		try {
			this.value = JSON.parse(
				// @ts-expect-error: un type null retourne null de toute manière
				localStorage.getItem(PersonalizationStorage.KEY),
				this.fromJSON,
			);
		} catch {
			this.value = PersonalizationStorage.default();
		}
	}

	// --------- //
	// Propriété //
	// --------- //

	private personalization = PersonalizationStorage.default();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get value(): PersonalizationData {
		return this.get();
	}

	set value($1: PersonalizationData) {
		this.set($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get(): PersonalizationData {
		return this.personalization;
	}

	/**
	 * Définit une nouvelle valeur.
	 */
	set(theme: PersonalizationData) {
		this.personalization = theme;

		try {
			localStorage.setItem(PersonalizationStorage.KEY, this.toString());
		} catch {}
	}

	/**
	 * Validation du JSON
	 */
	fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = ["theme"];
			if (!keys.includes(key)) return;
			if (!["dark", "ice", "light", "system"].includes(value)) return;
		}

		if (value == null) {
			return PersonalizationStorage.default();
		}

		return value;
	}

	save() {
		try {
			localStorage.setItem(PersonalizationStorage.KEY, this.toString());
		} catch {}
	}

	toString() {
		return JSON.stringify(this.personalization);
	}
}
