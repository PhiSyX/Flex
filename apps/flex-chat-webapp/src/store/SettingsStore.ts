// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Theme } from "~/theme";
import {
	type PersonalizationData,
	PersonalizationStorage,
} from "./local-storage/SettingsPersonalizationStorage";

export class SettingsStore {
	static readonly NAME = "settings-store";

	static default(): SettingsStore {
		const def = reactive(new SettingsStore());
		return def as SettingsStore;
	}

	// --------- //
	// Propriété //
	// --------- //

	public personalization: PersonalizationSettings =
		new PersonalizationSettings();

	save() {
		this.personalization.persist();
	}
}

export class PersonalizationSettings {
	storage = new PersonalizationStorage();

	get theme() {
		return this.storage.get().theme;
	}

	set theme(value: PersonalizationData["theme"]) {
		this.storage.set({ ...this.storage.value, theme: value });
	}

	persist() {
		this.storage.save();
	}
}

export const useSettingsStore = defineStore(SettingsStore.NAME, () => {
	const store = SettingsStore.default();
	return {
		...store,
		save: store.save.bind(store),
	};
});
