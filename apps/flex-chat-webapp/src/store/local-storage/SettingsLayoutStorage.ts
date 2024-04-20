// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { markRaw } from "vue";
import { STORAGE_SETTINGS_LAYOUT_KEY } from "./constant";

export interface LayoutData {
	channelUserlistPosition?: "left" | "right";
	navigationBarPosition?: "left" | "right";
}

// -------------- //
// Implémentation //
// -------------- //

export class LayoutStorage {
	// ------ //
	// Static //
	// ------ //

	static readonly KEY = STORAGE_SETTINGS_LAYOUT_KEY;

	static default(): LayoutData {
		return {
			channelUserlistPosition: "right",
			navigationBarPosition: "left",
		};
	}

	// ----------- //
	// Constructor //
	// ----------- //

	constructor() {
		try {
			this.value = JSON.parse(
				// @ts-expect-error: un type null retourne null de toute manière
				localStorage.getItem(LayoutStorage.KEY),
				this.fromJSON.bind(this),
			);
		} catch {
			this.value = LayoutStorage.default();
		}
	}

	// --------- //
	// Propriété //
	// --------- //

	private layout = LayoutStorage.default();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get value(): LayoutData {
		return this.get();
	}

	set value($1: LayoutData) {
		this.set($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get(): LayoutData {
		return this.layout;
	}

	/**
	 * Définit une nouvelle valeur.
	 */
	set(layout: LayoutData) {
		this.layout = layout;

		try {
			localStorage.setItem(LayoutStorage.KEY, this.toString());
		} catch {}
	}

	/**
	 * Validation du JSON
	 */
	fromJSON(key: string, value: string): unknown | undefined {
		if (key !== "") {
			let keys = ["channelUserlistPosition", "navigationBarPosition"];
			if (!keys.includes(key)) return;
			if (!["left", "right"].includes(value)) return;
		}

		if (value == null) {
			return LayoutStorage.default();
		}

		return value;
	}

	save() {
		try {
			localStorage.setItem(LayoutStorage.KEY, this.toString());
		} catch {}
	}

	toString() {
		return JSON.stringify(markRaw(this.layout));
	}
}
