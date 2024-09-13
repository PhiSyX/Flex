// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	DialogArgs,
	DialogClass,
	DialogInterface,
} from "../../dialogs/interface";
import type { DirectAccessChatManager } from "./datamanager/chat_data_manager";
import type { DirectAccessOverlayerManager } from "./datamanager/overlay_data_manager";
import type { DirectAccessUserManager } from "./datamanager/user_data_manageer";
import type { DirectAccessPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessInteractor {
	private presenter!: DirectAccessPresenter;
	private chat_manager!: DirectAccessChatManager;
	private user_manager!: DirectAccessUserManager;
	private overlayer_manager!: DirectAccessOverlayerManager;

	// ------- //
	// Méthode // -> Instance
	// ------- //

	with_presenter(presenter: DirectAccessPresenter): this {
		this.presenter = presenter;
		return this;
	}

	with_chat_datamanager(datamanager: DirectAccessChatManager): this {
		this.chat_manager = datamanager;
		return this;
	}

	with_user_datamanager(datamanager: DirectAccessUserManager): this {
		this.user_manager = datamanager;
		return this;
	}

	with_overlayer_datamanager(
		datamanager: DirectAccessOverlayerManager,
	): this {
		this.overlayer_manager = datamanager;
		return this;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	auth_user(nickname: string, password: string) {
		this.chat_manager.send_active_room(
			`/AUTH IDENTIFY ${nickname} ${password}`,
		);
	}

	create_dialog<D extends DialogClass<DialogInterface<R>>, R>(
		dialog: D,
		...args: DialogArgs<D, R>
	) {
		this.overlayer_manager.create_dialog(dialog, ...args);
	}

	async connect_chat() {
		await this.chat_manager.load_all_modules();
		this.chat_manager.connect(this.presenter.view.form_data, {
			welcome: () => this.presenter.view.handle_reply_welcome(),
			nicknameinuse: (data) =>
				this.presenter.view.handle_reply_nicknameinuse(data),
		});
	}

	fetch_user_session() {
		return this.user_manager.get_user_session();
	}
}
