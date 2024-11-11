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
import type { ChannelListInteractor } from "./interactor";
import type { ChannelListRouter } from "./router";
import type { ChannelListView } from "./view";

import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelListPresenter {
	constructor(
		public router: ChannelListRouter,
		public view: ChannelListView,
	) {
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<ChannelListInteractor> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): ChannelListInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: ChannelListInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	get_channels_list() {
		return this.interactor.get_channels_list();
	}

	get_server_room_name() {
		return this.interactor.get_room_name(this.router.servername_param());
	}

	join_channel(name: ChannelID) {
		this.interactor.join_channel(name);
	}

	open_join_channel_dialog(evt: Event) {
		this.interactor.create_join_channel_dialog(evt);
	}
}
