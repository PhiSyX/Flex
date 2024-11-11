// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer } from "@phisyx/flex-chat/store";
import type { Option } from "@phisyx/flex-safety/option";
import type { CustomRoomServerInteractor } from "./interactor";
import type { CustomRoomServerView } from "./view";

import { assert_non_null}  from "@phisyx/flex-safety/asserts";
import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerPresenter {
	constructor(view: CustomRoomServerView) {
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<CustomRoomServerInteractor> = None();
	view: CustomRoomServerView;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): CustomRoomServerInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: CustomRoomServerInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	completion_list(): Array<string> {
		return this.interactor.get_all_commands(this.view.room);
	}

	open_colors_box(evt: Event) {
		this.interactor.create_colors_box(evt);
	}

	open_room(room_id: RoomID) {
		this.interactor.open_room(room_id);
	}

	open_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		this.interactor.create_user_change_nickname_dialog(evt);
	}

	get_current_user_nickname(): string {
		return this.interactor.get_current_client_nickname();
	}

	layout_settings() {
		return this.interactor.layout_settings();
	}

	personalization_settings() {
		return this.interactor.personalization_settings();
	}

	send(message: string) {
		assert_non_null(this.view.room);
		this.interactor.send_to(this.view.room.id(), message);
	}
}
