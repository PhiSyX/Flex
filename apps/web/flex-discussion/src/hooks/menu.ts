// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	MenuClass,
	MenuInterface,
} from "@phisyx/flex-chat/menu/interface";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";

import { computed } from "vue";

import { use_overlayer_store } from "~/store";

// -------- //
// Fonction //
// -------- //

export function use_menu<
	T extends MenuInterface<R>,
	R,
	// R extends MenuInterface<R>[""]
>(menu_cls: MenuClass<T>) {
	let overlayer_store = use_overlayer_store();

	let layer_name: string = menu_cls.ID;
	let teleport_id = computed(() => `#${layer_name}_teleport`);

	let menu = computed(
		() => new menu_cls(overlayer_store.store as OverlayerStore),
	);

	let layer = computed(() => menu.value.get());
	let layer_unsafe = computed(() => menu.value.get_unchecked());

	function create_menu(
		...args: Array<Parameters<MenuClass<T>["create"]>[1]>
	) {
		menu_cls.create(overlayer_store.store as OverlayerStore, ...args);
	}

	function close_menu() {
		menu.value.destroy();
	}

	function update_menu() {
		overlayer_store.update(layer_name);
	}

	return {
		teleport_id,
		menu,

		layer,
		layer_name,
		layer_unsafe,

		create_menu,
		close_menu,
		update_menu,
	};
}
