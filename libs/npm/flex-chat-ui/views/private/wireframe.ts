// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterAntiCorruptionLayer } from "@phisyx/flex-architecture";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
} from "@phisyx/flex-chat/store";

import { PrivateChatManager } from "./datamanager/chat_data_manager";
import { PrivateOverlayerManager } from "./datamanager/overlayer_data_manager";
import { PrivateSettingsManager } from "./datamanager/settings_data_manager";
import { PrivateInteractor } from "./interactor";
import { PrivatePresenter } from "./presenter";
import { PrivateView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateWireframe {
	static create(
		router_acl: RouterAntiCorruptionLayer,
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
	) {
		let interactor = new PrivateInteractor(
			new PrivatePresenter(router_acl, new PrivateView()),
			[
				new PrivateChatManager(chat_store),
				new PrivateOverlayerManager(overlayer_store),
				new PrivateSettingsManager(settings_store),
			],
		);

		return interactor.presenter.view;
	}

	declare _: number;
}
