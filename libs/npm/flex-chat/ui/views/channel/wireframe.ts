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

import { ChannelChatManager } from "./datamanager/chat_data_manager";
import { ChannelOverlayerManager } from "./datamanager/overlayer_data_manager";
import { ChannelSettingsManager } from "./datamanager/settings_data_manager";
import { ChannelInteractor } from "./interactor";
import { ChannelPresenter } from "./presenter";
import { ChannelView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelWireframe {
	static create(
		router_acl: RouterContract,
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store: OverlayerStore,
		settings_store: SettingsStore,
	) {
		let interactor = new ChannelInteractor(
			new ChannelPresenter(router_acl, new ChannelView()),
			[
				new ChannelChatManager(chat_store),
				new ChannelOverlayerManager(overlayer_store),
				new ChannelSettingsManager(settings_store),
			],
		);
		return interactor.presenter.view;
	}

	declare _: number;
}
