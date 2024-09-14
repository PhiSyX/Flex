// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { UserSession } from "../../user/session";
import type { DirectAccessInteractor } from "./interactor";
import type { DirectAccessRouter } from "./router";
import type { DirectAccessView } from "./view";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessPresenter {
	view!: DirectAccessView;
	interactor!: DirectAccessInteractor;
	router!: DirectAccessRouter;

	// ------- //
	// Méthode // -> Instance
	// ------- //

	with_interactor(interactor: DirectAccessInteractor): this {
		this.interactor = interactor;
		return this;
	}

	with_view(view: DirectAccessView): this {
		this.view = view;
		return this;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	async connect_chat_server() {
		await this.interactor.connect_chat();
	}

	create_update_account_dialog(user_session: UserSession) {
		this.interactor.create_update_account_dialog(user_session);
	}

	send_auth_command() {
		this.interactor.auth_user(
			this.view.form_data.nickname,
			this.view.form_data.password_user,
		);
	}

	user_session() {
		return this.interactor.fetch_user_session();
	}
}
