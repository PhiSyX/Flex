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
import { type LayoutData, LayoutStorage } from "../local/settings_layout";
import {
	type PersonalizationData,
	PersonalizationStorage,
} from "../local/settings_personalization";

export class SettingsStore {
	static readonly NAME = "settings-store";

	static default(): SettingsStore {
		const def = reactive(new SettingsStore());
		return def as SettingsStore;
	}

	// --------- //
	// Propriété //
	// --------- //

	personalization: PersonalizationSettings = new PersonalizationSettings();
	layout: LayoutSettings = new LayoutSettings();

	save() {
		this.personalization.persist();
		this.layout.persist();
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

export class LayoutSettings {
	storage = new LayoutStorage();

	get channelUserlistDisplay() {
		return this.storage.get().channelUserlistDisplay;
	}

	set channelUserlistDisplay(value: LayoutData["channelUserlistDisplay"]) {
		this.storage.set({
			...this.storage.value,
			channelUserlistDisplay: value,
		});
	}

	get channelUserlistPosition() {
		return this.storage.get().channelUserlistPosition;
	}

	set channelUserlistPosition(value: LayoutData["channelUserlistPosition"]) {
		this.storage.set({
			...this.storage.value,
			channelUserlistPosition: value,
		});
	}

	get navigationBarPosition() {
		return this.storage.get().navigationBarPosition;
	}

	set navigationBarPosition(value: LayoutData["navigationBarPosition"]) {
		this.storage.set({
			...this.storage.value,
			navigationBarPosition: value,
		});
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
