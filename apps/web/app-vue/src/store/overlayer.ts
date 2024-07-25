// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { type Layer, OverlayerStore } from "@phisyx/flex-chat";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

// ----- //
// Store //
// ----- //

export const useOverlayerStore = defineStore(OverlayerStore.ID, () => {
	const store = reactive(new OverlayerStore()) as OverlayerStore;

	const layers = computed(() => store.layers);
	const hasLayers = computed(() => store.hasLayers);

	function create<D = unknown>(payload: Layer<D>): Layer<D> {
		return store.create(payload);
	}

	function destroy(layerID: Layer["id"]) {
		store.destroy(layerID);
	}

	function destroyAll(options: { force: boolean } = { force: false }) {
		store.destroyAll(options);
	}

	function update(layerID: Layer["id"]) {
		store.update(layerID);
	}

	function updateData<D = unknown>(layerID: Layer<D>["id"], data: D) {
		store.updateData(layerID, data);
	}

	function updateAll() {
		store.updateAll();
	}

	return {
		create,
		destroy,
		destroyAll,
		hasLayers,
		layers,
		store,
		update,
		updateAll,
		updateData,
	};
});
