// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { STORAGE_REMEMBER_ME_KEY } from "./constant";

// -------------- //
// Implémentation //
// -------------- //

export class RememberMeStorage {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_REMEMBER_ME_KEY;

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		try {
			this.rememberMe = JSON.parse(
				// @ts-expect-error: un type null retourne null de toute manière
				localStorage.getItem(STORAGE_REMEMBER_ME_KEY),
				this.fromJSON
			);
		} catch {}
	}

	// --------- //
	// Propriété //
	// --------- //

	private rememberMe = false;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get value(): boolean {
		return this.get();
	}

	set value($1: boolean) {
		this.set($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get(): boolean {
		return this.rememberMe;
	}

	/**
	 * Définit une nouvelle valeur.
	 */
	set(rememberMeValue: boolean) {
		this.rememberMe = rememberMeValue;

		try {
			localStorage.setItem(STORAGE_REMEMBER_ME_KEY, this.toString());
		} catch {}
	}

	/**
	 * Validation du JSON
	 */
	fromJSON(key: string, value: unknown) {
		if (key.length === 0 && typeof value === "boolean") {
			return value;
		}
	}

	toString() {
		return JSON.stringify(this.rememberMe);
	}
}
