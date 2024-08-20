// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DialogClass, DialogInterface, OverlayerStore } from "@phisyx/flex-chat";

import { computed } from "vue";

import { use_overlayer_store } from "~/store";

// -------- //
// Fonction //
// -------- //

export function use_dialog<
	T extends DialogInterface<R>,
	R,
	// R extends DialogInterface<R>[""]
>(dialog_cls: DialogClass<T>)
{
	let overlayer_store = use_overlayer_store();

	let layer_name: string = dialog_cls.ID;
	let teleport_id = computed(() => `#${layer_name}_teleport`);

	let dialog = computed(() => new dialog_cls(overlayer_store.store as OverlayerStore));

	let layer = computed(() => dialog.value.get());
	let layer_unsafe = computed(() => dialog.value.get_unchecked());

	function create_dialog(...args: Array<Parameters<DialogClass<T>["create"]>[1]>)
	{
		dialog_cls.create(overlayer_store.store as OverlayerStore, ...args);
	}

	function close_dialog()
	{
		dialog.value.destroy();
	}

	function update_dialog()
	{
		overlayer_store.update(layer_name);
	}

	return {
		teleport_id,
		dialog,
		
		layer,
        layer_name,
		layer_unsafe,

		create_dialog,
		close_dialog,
		update_dialog,
	}
}
