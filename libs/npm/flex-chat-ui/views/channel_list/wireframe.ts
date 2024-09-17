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
	OverlayerStore,
} from "@phisyx/flex-chat/store";

import { ChannelListChatManager } from "./datamanager/chat_data_manager";
import { ChannelListOverlayerManager } from "./datamanager/overlayer_data_manager";
import { ChannelListInteractor } from "./interactor";
import { ChannelListPresenter } from "./presenter";
import { ChannelListRouter } from "./router";
import { ChannelListView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelListWireframe {
	static create(
		router_acl: RouterAntiCorruptionLayer,
		chat_store: ChatStoreInterface,
		overlayer_store: OverlayerStore,
	) {
		let interactor = new ChannelListInteractor(
			new ChannelListPresenter(
				new ChannelListRouter(router_acl),
				new ChannelListView(),
			),
			[
				new ChannelListChatManager(chat_store),
				new ChannelListOverlayerManager(overlayer_store),
			],
		);
		return interactor.presenter.view;
	}

	declare _: number;
}
