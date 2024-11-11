// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterContract } from "@phisyx/flex-architecture/router";
import type {
	ChatStoreInterface,
	SettingsStore,
} from "@phisyx/flex-chat/store";

import { SettingsChatManager } from "./datamanager/chat_data_manager";
import { SettingsSettingsManager } from "./datamanager/settings_data_manager";
import { SettingsInteractor } from "./interactor";
import { SettingsPresenter } from "./presenter";
import { SettingsRouter } from "./router";
import { SettingsView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsWireframe {
	static create(
		router_acl: RouterContract,
		chat_store: ChatStoreInterface,
		settings_store: SettingsStore,
	) {
		let interactor = new SettingsInteractor(
			new SettingsPresenter(
				new SettingsRouter(router_acl),
				new SettingsView(),
			),
			[
				new SettingsChatManager(chat_store),
				new SettingsSettingsManager(settings_store),
			],
		);

		return interactor.presenter.view;
	}

	declare _: number;
}
