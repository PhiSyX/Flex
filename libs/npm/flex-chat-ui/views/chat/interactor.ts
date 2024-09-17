// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelChatManager } from "./datamanager/chat_data_manager";
import type { ChatPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class ChatInteractor {
	constructor(
		presenter: ChatPresenter,
		datamanager: [chat: ChannelChatManager],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: ChatPresenter;

	private chat_manager!: ChannelChatManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	close(name: RoomID) {
		this.chat_manager.close(name);
	}
	join(name: ChannelID) {
		this.chat_manager.join(name);
	}

	get_all_rooms() {
		return this.chat_manager.get_all_rooms();
	}
}
