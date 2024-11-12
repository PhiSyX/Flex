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
import { DialogApiManager } from "./datamanager/api_data_manager";
import { DialogChatManager } from "./datamanager/chat_data_manager";
import { DialogOverlayerManager } from "./datamanager/overlayer_data_manager";
import { DialogSettingsManager } from "./datamanager/settings_data_manager";
import { DialogUserManager } from "./datamanager/user_data_manager";
import { DialogInteractor } from "./interactor";
import { DialogPresenter } from "./presenter";
import { DialogView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class DialogWireframe {
	static create(
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
		user_store: UserStore,
	) {
		let interactor = new DialogInteractor(
			new DialogPresenter(new DialogView()),
			[
				new DialogChatManager(chat_store),
				new DialogOverlayerManager(overlayer_store),
				new DialogSettingsManager(settings_store),
				new DialogUserManager(user_store),
				new DialogApiManager(),
			],
		);
		return interactor.presenter.view;
	}

	declare _: number;
}
