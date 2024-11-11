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
import type { ChannelListPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelListView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<ChannelListPresenter> = None();

	maybe_servername: Option<RoomID> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChannelListPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: ChannelListPresenter) {
		this.presenter_ref.replace($1);
	}

	// Liste des salons (récupérés préalablement via /LIST)
	get list() {
		return this.presenter.get_channels_list();
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	set_servername_from_route_param() {
		this.maybe_servername = this.presenter.get_server_room_name();
	}
	// ------- //
	// Méthode // -> Handler
	// ------- //

	join_channel_handler = (name: ChannelID) => {
		this.presenter.join_channel(name);
	};

	open_join_channel_dialog_handler = (evt: Event) => {
		this.presenter.open_join_channel_dialog(evt);
	};
}
