// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";
import { MenuChatManager } from "./datamanager/chat_data_manager";
import { MenuOverlayerManager } from "./datamanager/overlayer_data_manager";
import { MenuSettingsManager } from "./datamanager/settings_data_manager";
import { MenuUserManager } from "./datamanager/user_data_manager";
import { MenuInteractor } from "./interactor";
import { MenuPresenter } from "./presenter";
import { MenuView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class MenuWireframe {
	static create(
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
		user_store: UserStore,
	) {
		let interactor = new MenuInteractor(new MenuPresenter(new MenuView()), [
			new MenuChatManager(chat_store),
			new MenuOverlayerManager(overlayer_store),
			new MenuSettingsManager(settings_store),
			new MenuUserManager(user_store),
		]);
		return interactor.presenter.view;
	}

	declare _: number;
}
