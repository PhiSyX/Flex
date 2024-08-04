// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer } from "@phisyx/flex-chat";

import {
	onBeforeMount as on_before_mount,
	onBeforeUnmount as on_before_unmount
} from "vue";

import { use_overlayer_store } from "~/store";

// ----- //
// Hooks //
// ----- //

export function use_overlayer()
{
	let overlayer_store = use_overlayer_store();

	function destroy_handler(_: Event, id?: Layer["id"])
	{
		if (id) {
			overlayer_store.destroy(id);
		} else {
			overlayer_store.destroy_all();
		}
	}

	function keydown_handler(evt: KeyboardEvent)
	{
		if (evt.code === "Escape") {
			overlayer_store.destroy_all();
		}
	}

	function resize_handler()
	{
		overlayer_store.update_all();
	}

	on_before_mount(() => {
		window.addEventListener("resize", resize_handler, { passive: true });
		window.addEventListener("keydown", keydown_handler);
	});

	on_before_unmount(() => {
		window.removeEventListener("resize", resize_handler);
		window.removeEventListener("keydown", keydown_handler);
	});

	return { store: overlayer_store, destroy_handler, resize_handler };
}
