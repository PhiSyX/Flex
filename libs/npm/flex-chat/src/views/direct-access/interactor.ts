// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DialogArgs, DialogClass, DialogInterface } from "../../dialogs/interface";
import type { DirectAccessDataManager } from "./datamanager";
import type { DirectAccessPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessInteractor
{
	private presenter!: DirectAccessPresenter;
	private datamanager!: DirectAccessDataManager;

	// ------- //
	// Méthode // -> Instance
	// ------- //

	with_presenter(presenter: DirectAccessPresenter): this
	{
		this.presenter = presenter;
		return this;
	}

	with_datamanager(datamanager: DirectAccessDataManager): this
	{
		this.datamanager = datamanager;
		return this;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	auth_user(nickname: string, password: string)
	{
		this.datamanager.send_active_room(
			`/AUTH IDENTIFY ${nickname} ${password}`
		);
	}

	create_dialog<
		D extends DialogClass<DialogInterface<R>>,
		R,
	>(dialog: D, ...args: DialogArgs<D, R>)
	{
		this.datamanager.create_dialog(dialog, ...args);
	}

	async connect_chat()
	{
		await this.datamanager.load_all_modules();
		this.datamanager.connect(this.presenter.view.form_data, {
			welcome: () => this.presenter.view.handle_reply_welcome(),
			nicknameinuse: (data) =>
				this.presenter.view.handle_reply_nicknameinuse(data),
		});
	}

	fetch_user_session()
	{
		return this.datamanager.get_user_session();
	}
}
