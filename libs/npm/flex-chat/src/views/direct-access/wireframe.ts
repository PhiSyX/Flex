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
} from "../../store";

import { DirectAccessChatManager } from "./datamanager/chat_data_manager";
import { DirectAccessUserManager } from "./datamanager/user_data_manageer";
import { DirectAccessInteractor } from "./interactor";
import { DirectAccessPresenter } from "./presenter";
import { DirectAccessView } from "./view";
import { DirectAccessOverlayerManager } from "./datamanager/overlay_data_manager";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessWireframe {
	static create(
		router_acl: RouterAntiCorruptionLayer,
		chat_store: ChatStoreInterface & ChatStoreInterfaceExt,
		user_store: UserStore,
		overlayer_store: OverlayerStore,
	) {
		let view = new DirectAccessView();

		let presenter = new DirectAccessPresenter().with_view(view);
		let interactor = new DirectAccessInteractor()
			.with_presenter(presenter)
			.with_chat_datamanager(new DirectAccessChatManager(chat_store))
			.with_user_datamanager(new DirectAccessUserManager(user_store))
			.with_overlayer_datamanager(
				new DirectAccessOverlayerManager(overlayer_store),
			);

		view.with_presenter(presenter).with_router(router_acl);
		presenter.with_interactor(interactor);

		return view;
	}

	declare _: number;
}
