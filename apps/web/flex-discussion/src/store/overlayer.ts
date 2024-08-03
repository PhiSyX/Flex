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
import { computed, reactive } from "vue";

import { OverlayerStore } from "@phisyx/flex-chat";

// ----- //
// Store //
// ----- //

export const useOverlayerStore = defineStore(OverlayerStore.ID, () => {
	let store = reactive(new OverlayerStore()) as OverlayerStore;

	let layers = computed(() => store.layers);
	let hasLayers = computed(() => store.hasLayers);

	return {
		create: store.create.bind(store),
		destroy: store.destroy.bind(store),
		destroyAll: store.destroyAll.bind(store),
		get: store.get.bind(store),
		has: store.has.bind(store),
		hasLayers,
		layers,
		store,
		update: store.update.bind(store),
		updateAll: store.updateAll.bind(store),
		updateData: store.updateData.bind(store),
	};
});
