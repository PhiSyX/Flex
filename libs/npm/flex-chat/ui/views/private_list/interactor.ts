// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateListChatManager } from "./datamanager/chat_data_manager";
import type { PrivateListPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateListInteractor {
	constructor(
		presenter: PrivateListPresenter,
		datamanager: [chat: PrivateListChatManager],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: PrivateListPresenter;

	private chat_manager!: PrivateListChatManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get_privates_waiting() {
		return this.chat_manager.get_privates_waiting();
	}

	open_pending_private(priv: Origin) {
		this.chat_manager.open_pending_private(priv);
	}
}
