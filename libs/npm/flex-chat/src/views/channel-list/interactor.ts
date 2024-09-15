// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelListChatManager } from "./datamanager/chat_data_manager";
import type { ChannelListOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { ChannelListPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelListInteractor {
	constructor(
		presenter: ChannelListPresenter,
		datamanager: [
			chat: ChannelListChatManager,
			overlayer: ChannelListOverlayerManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: ChannelListPresenter;

	private chat_manager!: ChannelListChatManager;
	private overlayer_manager!: ChannelListOverlayerManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get_channels_list() {
		return this.chat_manager.get_channels_list();
	}

	get_room_name(from: string) {
		return this.chat_manager.get_room_name(from);
	}

	create_join_channel_dialog(evt: Event) {
		this.overlayer_manager.create_join_channel_dialog(evt);
	}

	join_channel(name: ChannelID) {
		this.chat_manager.join_channel(name);
	}
}
