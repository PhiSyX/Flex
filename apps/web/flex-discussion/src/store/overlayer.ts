// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	acceptHMRUpdate as accept_hmr_update,
	defineStore as define_store
} from "pinia";
import { computed, reactive } from "vue";

import { OverlayerStore } from "@phisyx/flex-chat";

// ----- //
// Store //
// ----- //

export const use_overlayer_store = define_store(OverlayerStore.ID, () => {
	let store = reactive(new OverlayerStore()) as OverlayerStore;

	let layers = computed(() => store.layers);
	let has_layers = computed(() => store.has_layers);

	return {
		create: store.create.bind(store),
		destroy: store.destroy.bind(store),
		destroy_all: store.destroy_all.bind(store),
		get: store.get.bind(store),
		get_unchecked: store.get_unchecked.bind(store),
		has: store.has.bind(store),
		has_layers,
		layers,
		store,
		update: store.update.bind(store),
		update_all: store.update_all.bind(store),
		update_data: store.update_data.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_overlayer_store, import.meta.hot));
}
