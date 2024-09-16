// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";
import type { ChatPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class ChatView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<ChatPresenter> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChatPresenter {
		return this.presenter_ref.unwrap();
	}

	set presenter($1: ChatPresenter) {
		this.presenter_ref.replace($1);
	}

	get rooms() {
		return this.presenter.get_all_rooms();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	join_channel_handler = (name: ChannelID) => {
		this.presenter.join(name);
	};

	close_room_handler = (name: RoomID) => {
		this.presenter.close(name);
	};
}
