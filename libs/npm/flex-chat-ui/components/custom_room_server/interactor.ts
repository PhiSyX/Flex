// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer, Room } from "@phisyx/flex-chat";
import type { CustomRoomServerChatManager } from "./datamanager/chat_data_manager";
import type { CustomRoomServerOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { CustomRoomServerSettingsManager } from "./datamanager/settings_data_manager";
import type { CustomRoomServerPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerInteractor {
	constructor(
		presenter: CustomRoomServerPresenter,
		datamanager: [
			chat: CustomRoomServerChatManager,
			overlayer: CustomRoomServerOverlayerManager,
			settings: CustomRoomServerSettingsManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
		this.settings_manager = datamanager[2];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: CustomRoomServerPresenter;

	private chat_manager!: CustomRoomServerChatManager;
	private overlayer_manager!: CustomRoomServerOverlayerManager;
	private settings_manager!: CustomRoomServerSettingsManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	create_colors_box(evt: Event) {
		this.overlayer_manager.create_colors_box(evt);
	}

	create_user_change_nickname_dialog(event: Required<Layer["event"]>) {
		this.overlayer_manager.create_user_change_nickname_dialog(event);
	}

	get_all_commands(room: Room): Array<string> {
		return this.chat_manager.get_all_commands(room);
	}

	get_current_client_nickname(): string {
		return this.chat_manager.get_current_client_nickname();
	}

	layout_settings() {
		return this.settings_manager.layout_settings();
	}

	personalization_settings() {
		return this.settings_manager.personalization_settings();
	}

	open_room(room_id: RoomID) {
		this.chat_manager.open_room(room_id);
	}

	send_to(room_id: RoomID, message: string) {
		this.chat_manager.send_to(room_id, message);
	}
}
