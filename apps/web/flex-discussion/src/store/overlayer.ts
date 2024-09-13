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
	defineStore as define_store,
} from "pinia";
import { computed, reactive, readonly } from "vue";

import { OverlayerData, OverlayerStore } from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

class OverlayerStoreVue extends OverlayerStore {
	get layers() {
		return computed(() => readonly(this.data.layers));
	}

	get has_layers() {
		return computed(() => this.data.has_layers);
	}

	get $overlayer_mut() {
		return computed({
			get: () => this.$overlayer,
			set: ($1) => {
				this.$overlayer = $1;
			},
		});
	}

	get $teleport_mut() {
		return computed({
			get: () => this.$teleport,
			set: ($1) => {
				this.$teleport = $1;
			},
		});
	}
}

// ----- //
// Store //
// ----- //

export const use_overlayer_store = define_store(OverlayerStore.NAME, () => {
	const store = new OverlayerStoreVue(reactive(new OverlayerData()));

	return {
		has_layers: store.has_layers,
		layers: store.layers,

		$overlayer_mut: store.$overlayer_mut,
		$teleport_mut: store.$teleport_mut,

		// -------- //
		// Redirect //
		// -------- //

		store: store as OverlayerStore,

		create: store.create.bind(store),
		destroy: store.destroy.bind(store),
		destroy_all: store.destroy_all.bind(store),
		get: store.get.bind(store),
		get_unchecked: store.get_unchecked.bind(store),
		has: store.has.bind(store),
		update: store.update.bind(store),
		update_all: store.update_all.bind(store),
		update_data: store.update_data.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(
		accept_hmr_update(use_overlayer_store, import.meta.hot),
	);
}
