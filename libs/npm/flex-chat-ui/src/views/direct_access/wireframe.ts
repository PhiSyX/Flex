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
	UserStore,
} from "@phisyx/flex-chat";

import { DirectAccessChatManager } from "./datamanager/chat_data_manager";
import { DirectAccessOverlayerManager } from "./datamanager/overlay_data_manager";
import { DirectAccessUserManager } from "./datamanager/user_data_manager";
import { DirectAccessInteractor } from "./interactor";
import { DirectAccessPresenter } from "./presenter";
import { DirectAccessView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessWireframe {
	static create(
		router_acl: RouterAntiCorruptionLayer,
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		user_store: UserStore,
		overlayer_store: OverlayerStore,
		handlers: Record<string, () => Promise<unknown>>,
		modules: Record<string, () => Promise<unknown>>,
	) {
		let interactor = new DirectAccessInteractor(
			new DirectAccessPresenter(router_acl, new DirectAccessView()),
			[
				new DirectAccessChatManager(chat_store, {
					handlers,
					modules,
				}),
				new DirectAccessOverlayerManager(overlayer_store),
				new DirectAccessUserManager(user_store),
			],
		);

		return interactor.presenter.view;
	}

	declare _: number;
}
