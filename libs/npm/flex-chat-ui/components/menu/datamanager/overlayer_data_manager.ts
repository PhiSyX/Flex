// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelSettingsRecordDialog } from "@phisyx/flex-chat/dialogs";
import type { OverlayerStore } from "@phisyx/flex-chat/store";

import { ChannelSettingsDialog } from "@phisyx/flex-chat/dialogs";

// -------------- //
// Implémentation //
// -------------- //

export class MenuOverlayerManager {
	constructor(public store: OverlayerStore) {}

	destroy_menu(id: string) {
		return this.store.destroy(id);
	}

	has_data_menu(id: string) {
		return this.store.get(id).unwrap().data != null;
	}

	get_data_menu(id: string) {
		return this.store.get(id).unwrap().data || {};
	}

	is_menu_exists(id: string) {
		return this.store.has(id);
	}

	update_menu(id: string) {
		return this.store.update(id);
	}

	create_channel_settings_dialog(record: ChannelSettingsRecordDialog) {
		this.store.create({
			id: ChannelSettingsDialog.ID,
			destroyable: "manual",
			centered: true,
			data: record,
		});
	}
}
