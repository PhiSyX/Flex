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

import { UserStore, UserStoreData } from "@phisyx/flex-chat";

// ----- //
// Store //
// ----- //

export const use_user_store = define_store(UserStore.NAME, () => {
	const store = new UserStore(reactive(new UserStoreData()) as UserStoreData);
	return {
		store,
		disconnect: store.disconnect.bind(store),
		fetch: store.fetch.bind(store),
		patch: store.patch.bind(store),
		session: store.session.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_user_store, import.meta.hot));
}
