// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { LoadAllModulesRecordLayer } from "@phisyx/flex-chat/layers/load_all_modules";
import type { OverlayerStore } from "@phisyx/flex-chat/store";
import type { UserSession } from "@phisyx/flex-chat/user/session";

import { UpdateAccountDialog } from "@phisyx/flex-chat/dialogs";
import { LoadAllModulesLayer } from "@phisyx/flex-chat/layers/load_all_modules";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessOverlayerManager {
	constructor(private store: OverlayerStore) {}

	create_update_account_dialog(user_session: UserSession) {
		this.store.create({
			id: UpdateAccountDialog.ID,
			centered: true,
			data: user_session,
		});
	}

	create_module_layer(record: LoadAllModulesRecordLayer) {
		this.store.create({
			id: LoadAllModulesLayer.ID,
			centered: true,
			destroyable: "manual",
			data: record,
		});
	}

	destroy_module_layer() {
		this.store.destroy(LoadAllModulesLayer.ID);
	}

	update_data_module_layer(record: LoadAllModulesRecordLayer) {
		this.store.update_data(LoadAllModulesLayer.ID, record);
	}
}
