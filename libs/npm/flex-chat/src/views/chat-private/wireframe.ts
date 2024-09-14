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
} from "../../store";

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
		let view = new PrivateView();

		let presenter = new PrivatePresenter().with_view(view);
		let interactor = new PrivateInteractor()
			.with_presenter(presenter)
			.with_datamanager({
				chat: new PrivateChatManager(chat_store),
				overlayer: new PrivateOverlayerManager(overlayer_store),
				settings: new PrivateSettingsManager(settings_store),
			});

		view.with_presenter(presenter).with_router(router_acl);
		presenter.with_interactor(interactor);

		return view;
	}

	declare _: number;
}
