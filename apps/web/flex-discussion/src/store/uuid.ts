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
import { reactive } from "vue";

import { UUIDStore, UUIDStoreData } from "@phisyx/flex-chat";

// ----- //
// Store //
// ----- //

export const useUUIDv4Store = define_store(UUIDStore.IDv4, () => {
	const store = new UUIDStore(reactive(UUIDStoreData.v4()));
	return {
		take: store.take.bind(store),
	};
});

export const useUUIDv7Store = define_store(UUIDStore.IDv7, () => {
	const store = new UUIDStore(reactive(UUIDStoreData.v7()));
	return {
		take: store.take.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(useUUIDv4Store, import.meta.hot));
	import.meta.hot.accept(accept_hmr_update(useUUIDv7Store, import.meta.hot));
}
