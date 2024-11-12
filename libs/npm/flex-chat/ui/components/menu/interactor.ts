// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelSettingsRecordDialog } from "@phisyx/flex-chat/dialogs/channel_settings";
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { MenuChatManager } from "./datamanager/chat_data_manager";
import type { MenuOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { MenuSettingsManager } from "./datamanager/settings_data_manager";
import type { MenuUserManager } from "./datamanager/user_data_manager";
import type { MenuPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class MenuInteractor {
	constructor(
		presenter: MenuPresenter,
		datamanager: [
			chat: MenuChatManager,
			overlayer: MenuOverlayerManager,
			settings: MenuSettingsManager,
			user: MenuUserManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
		this.settings_manager = datamanager[2];
		this.user_manager = datamanager[3];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: MenuPresenter;

	private chat_manager!: MenuChatManager;
	private overlayer_manager!: MenuOverlayerManager;
	private settings_manager!: MenuSettingsManager;
	private user_manager!: MenuUserManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	destroy_menu(id: string) {
		return this.overlayer_manager.destroy_menu(id);
	}

	has_data_menu(id: string) {
		return this.overlayer_manager.has_data_menu(id);
	}

	get_data_menu(id: string) {
		return this.overlayer_manager.get_data_menu(id);
	}

	update_menu(id: string) {
		return this.overlayer_manager.update_menu(id);
	}

	is_menu_exists(id: string) {
		return this.overlayer_manager.is_menu_exists(id);
	}

	close_room(room_id: RoomID) {
		this.chat_manager.close_room(room_id);
	}

	get_current_client_id(): UserID {
		return this.chat_manager.get_current_client_id();
	}

	create_channel_settings_dialog(record: ChannelSettingsRecordDialog) {
		this.overlayer_manager.create_channel_settings_dialog(record);
	}

	create_update_account_dialog() {
		let user_session = this.user_manager.user_session().unwrap();
		this.overlayer_manager.create_update_account_dialog(user_session);
	}

	ignore_user(recipient: PrivateParticipant) {
		this.chat_manager.ignore_user(recipient);
	}
	unignore_user(recipient: PrivateParticipant) {
		this.chat_manager.unignore_user(recipient);
	}
}
