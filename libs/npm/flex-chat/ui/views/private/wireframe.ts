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
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";

import { PrivateChatManager } from "./datamanager/chat_data_manager";
import { PrivateOverlayerManager } from "./datamanager/overlayer_data_manager";
import { PrivateSettingsManager } from "./datamanager/settings_data_manager";
import { PrivateUserManager } from "./datamanager/user_data_manager";
import { PrivateInteractor } from "./interactor";
import { PrivatePresenter } from "./presenter";
import { PrivateView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateWireframe {
	static create(
		router_acl: RouterContract,
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
		user_store: UserStore,
	) {
		let interactor = new PrivateInteractor(
			new PrivatePresenter(router_acl, new PrivateView()),
			[
				new PrivateChatManager(chat_store),
				new PrivateOverlayerManager(overlayer_store),
				new PrivateSettingsManager(settings_store),
				new PrivateUserManager(user_store),
			],
		);

		return interactor.presenter.view;
	}

	declare _: number;
}
