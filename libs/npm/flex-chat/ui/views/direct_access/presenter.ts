// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterContract } from "@phisyx/flex-architecture/router";
import type { UserSession } from "@phisyx/flex-chat/user/session";
import type { Option } from "@phisyx/flex-safety";
import type { DirectAccessInteractor } from "./interactor";
import type { DirectAccessView } from "./view";

import { None } from "@phisyx/flex-safety";
import { DirectAccessRouter } from "./router";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessPresenter {
	constructor(router_acl: RouterContract, view: DirectAccessView) {
		this.router = new DirectAccessRouter(router_acl);
		this.view = view;
		this.view.presenter = this;
	}

	private interactor_ref: Option<DirectAccessInteractor> = None();

	view: DirectAccessView;
	router: DirectAccessRouter;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): DirectAccessInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: DirectAccessInteractor) {
		this.interactor_ref.replace($1);
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
