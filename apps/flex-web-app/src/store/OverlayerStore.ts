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
import { CSSProperties, computed, ref } from "vue";

// ---- //
// Type //
// ---- //

export type Layer = {
	id: string;
	centered?: boolean;
	destroyable?: "background" | "manual";
	style?: CSSProperties;
	onClose?: () => void;
};

export const useOverlayerStore = defineStore("overlayer-store", () => {
	const list = ref(new Map<string, Layer>());

	const hasLayers = computed(() => list.value.size > 0);

	const layers = computed(() => Array.from(list.value));

	function create(payload: Layer) {
		payload.destroyable ||= "background";
		list.value.set(payload.id, payload);
	}

	function destroy(layerID: Layer["id"]) {
		const layer = list.value.get(layerID);
		if (!layer) return;
		layer.onClose?.();
		list.value.delete(layerID);
	}

	function destroyAll(options: { force: boolean } = { force: false }) {
		for (const [_, layer] of list.value) {
			if (options.force) {
				destroy(layer.id);
				continue;
			}

			if (layer.destroyable !== "background") {
				continue;
			}

			destroy(layer.id);
		}
	}

	return {
		create,
		destroy,
		destroyAll,
		hasLayers,
		layers,
	};
});
