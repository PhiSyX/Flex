// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { LoadAllModulesRecordLayer, UserSession } from "@phisyx/flex-chat";
import type { DirectAccessChatManager } from "./datamanager/chat_data_manager";
import type { DirectAccessOverlayerManager } from "./datamanager/overlay_data_manager";
import type { DirectAccessUserManager } from "./datamanager/user_data_manager";
import type { DirectAccessPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessInteractor {
	constructor(
		presenter: DirectAccessPresenter,
		datamanager: [
			chat: DirectAccessChatManager,
			overlayer: DirectAccessOverlayerManager,
			user: DirectAccessUserManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.chat_manager.interactor = this;
		this.overlayer_manager = datamanager[1];
		this.user_manager = datamanager[2];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: DirectAccessPresenter;
	private chat_manager!: DirectAccessChatManager;
	private user_manager!: DirectAccessUserManager;
	private overlayer_manager!: DirectAccessOverlayerManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	auth_user(nickname: string, password: string) {
		this.chat_manager.send_active_room(
			`/AUTH IDENTIFY ${nickname} ${password}`,
		);
	}

	create_module_layer(record: { loaded: number; total_loaded: number }) {
		this.overlayer_manager.create_module_layer(record);
	}

	destroy_module_layer() {
		this.overlayer_manager.destroy_module_layer();
	}

	update_data_module_layer(record: LoadAllModulesRecordLayer) {
		this.overlayer_manager.update_data_module_layer(record);
	}

	async connect_chat() {
		await this.chat_manager.load_all_modules();
		this.chat_manager.connect(this.presenter.view.form_data, {
			welcome: () => this.presenter.view.handle_reply_welcome(),
			nicknameinuse: (data) =>
				this.presenter.view.handle_reply_nicknameinuse(data),
		});
	}

	create_update_account_dialog(user_session: UserSession) {
		this.overlayer_manager.create_update_account_dialog(user_session);
	}

	fetch_user_session() {
		return this.user_manager.get_user_session();
	}
}
