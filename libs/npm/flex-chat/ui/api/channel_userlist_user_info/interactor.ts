// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety/option";
import type { ChannelUserlistUserInfoAPIManager } from "./datamanager/api_data_manager";
import type { ChannelUserlistUserInfoPresenter } from "./presenter";
import type { ChannelUserlistUserInfoViewProps } from "./view";

import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelUserlistUserInfoInteractor {
	constructor(
		presenter: ChannelUserlistUserInfoPresenter,
		datamanager: [api: ChannelUserlistUserInfoAPIManager],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.api_manager = datamanager[0];
	}

	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<ChannelUserlistUserInfoPresenter> = None();
	private api_manager: ChannelUserlistUserInfoAPIManager;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChannelUserlistUserInfoPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: ChannelUserlistUserInfoPresenter) {
		this.presenter_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	query_api_user(props: Required<ChannelUserlistUserInfoViewProps>) {
		return this.api_manager.query_api_user_fetcher(props);
	}
}
