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
import { CustomRoomServerChatManager } from "./datamanager/chat_data_manager";
import { CustomRoomServerOverlayerManager } from "./datamanager/overlayer_data_manager";
import { CustomRoomServerSettingsManager } from "./datamanager/settings_data_manager";
import { CustomRoomServerInteractor } from "./interactor";
import { CustomRoomServerPresenter } from "./presenter";
import { CustomRoomServerView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerWireframe {
	static create(
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
	) {
		let interactor = new CustomRoomServerInteractor(
			new CustomRoomServerPresenter(new CustomRoomServerView()),
			[
				new CustomRoomServerChatManager(chat_store),
				new CustomRoomServerOverlayerManager(overlayer_store),
				new CustomRoomServerSettingsManager(settings_store),
			],
		);
		return interactor.presenter.view;
	}

	declare _: number;
}
