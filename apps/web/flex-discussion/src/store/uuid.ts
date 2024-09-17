// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { UUIDStore, UUIDStoreData } from "@phisyx/flex-chat/store/uuid";
import { acceptHMRUpdate, defineStore } from "pinia";
import { reactive } from "vue";

// ----- //
// Store //
// ----- //

export const useUUIDv4Store = defineStore(UUIDStore.IDv4, () => {
	const store = new UUIDStore(reactive(UUIDStoreData.v4()));
	return {
		take: store.take.bind(store),
	};
});

export const useUUIDv7Store = defineStore(UUIDStore.IDv7, () => {
	const store = new UUIDStore(reactive(UUIDStoreData.v7()));
	return {
		take: store.take.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUUIDv4Store, import.meta.hot));
	import.meta.hot.accept(acceptHMRUpdate(useUUIDv7Store, import.meta.hot));
}
