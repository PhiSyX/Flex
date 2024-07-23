// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { onBeforeMount, onBeforeUnmount } from "vue";

import { type Layer, useOverlayerStore } from "~/store";

// ----- //
// Hooks //
// ----- //

export function useOverlayer() {
	const overlayerStore = useOverlayerStore();

	function destroyHandler(_: Event, id?: Layer["id"]) {
		if (id) {
			overlayerStore.destroy(id);
		} else {
			overlayerStore.destroyAll();
		}
	}

	function keydownHandler(evt: KeyboardEvent) {
		if (evt.code === "Escape") overlayerStore.destroyAll();
	}

	function resizeHandler() {
		overlayerStore.updateAll();
	}

	onBeforeMount(() => {
		window.addEventListener("resize", resizeHandler, { passive: true });
		window.addEventListener("keydown", keydownHandler);
	});

	onBeforeUnmount(() => {
		window.removeEventListener("resize", resizeHandler);
		window.removeEventListener("keydown", keydownHandler);
	});

	return { store: overlayerStore, destroyHandler, resizeHandler };
}

// -------- //
// Fonction //
// -------- //
