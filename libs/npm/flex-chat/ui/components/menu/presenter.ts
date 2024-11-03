// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { Room } from "@phisyx/flex-chat/room";
import type { Option } from "@phisyx/flex-safety";
import type { MenuInteractor } from "./interactor";
import type { MenuView } from "./view";

import { is_channel_room } from "@phisyx/flex-chat/asserts/room";
import { assert_non_null, None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class MenuPresenter {
	constructor(view: MenuView) {
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<MenuInteractor> = None();
	view: MenuView;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): MenuInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: MenuInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	destroy_menu(id: string) {
		return this.interactor.destroy_menu(id);
	}

	has_data_menu(id: string) {
		return this.interactor.has_data_menu(id);
	}

	get_data_menu(id: string) {
		return this.interactor.get_data_menu(id);
	}

	update_menu(id: string) {
		return this.interactor.update_menu(id);
	}

	is_menu_exists(id: string) {
		return this.interactor.is_menu_exists(id);
	}

	close_room() {
		let room: Room = this.view.data.room;
		let room_nameid = room.id();
		if (is_channel_room(room)) {
			room_nameid = room.name;
		}
		this.interactor.close_room(room_nameid);
	}

	get_current_member(): Option<ChannelMember> {
		assert_non_null(this.view.data);
		let channel = this.view.data.room;
		let user_id = this.interactor.get_current_client_id();
		return channel.get_member(user_id);
	}

	open_channel_settings_dialog() {
		assert_non_null(this.view.data);

		let channel_settings_record = {
			room: this.view.data.room,
			currentClientChannelMember: this.view.current_client_channel_member,
		};

		this.interactor.create_channel_settings_dialog(channel_settings_record);
	}

	open_update_account_dialog() {
		assert_non_null(this.view.data);
		this.interactor.create_update_account_dialog();
	}

	ignore_user(recipient: PrivateParticipant) {
		this.interactor.ignore_user(recipient);
	}
	unignore_user(recipient: PrivateParticipant) {
		this.interactor.unignore_user(recipient);
	}
}
