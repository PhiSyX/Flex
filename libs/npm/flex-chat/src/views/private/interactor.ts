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
import type { PrivateParticipant } from "../../private/participant";
import type { PrivateRoom } from "../../private/room";
import type { Layer } from "../../store";
import type { PrivateChatManager } from "./datamanager/chat_data_manager";
import type { PrivateOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { PrivateSettingsManager } from "./datamanager/settings_data_manager";
import type { PrivatePresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateInteractor {
	constructor(
		presenter: PrivatePresenter,
		datamanager: [
			chat: PrivateChatManager,
			overlayer: PrivateOverlayerManager,
			settings: PrivateSettingsManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
		this.settings_manager = datamanager[2];
	}

	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<PrivatePresenter> = None();
	private chat_manager!: PrivateChatManager;
	private overlayer_manager!: PrivateOverlayerManager;
	private settings_manager!: PrivateSettingsManager;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): PrivatePresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: PrivatePresenter) {
		this.presenter_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	create_colors_box(evt: Event) {
		this.overlayer_manager.create_colors_box(evt);
	}

	create_private_pending_request_dialog(participant: PrivateParticipant) {
		this.overlayer_manager.create_private_pending_request_dialog(
			participant,
		);
	}
	destroy_private_pending_request_dialog() {
		this.overlayer_manager.destroy_private_pending_request_dialog();
	}

	create_user_change_nickname_dialog(event: Required<Layer["event"]>) {
		this.overlayer_manager.create_user_change_nickname_dialog(event);
	}

	close(id: UserID) {
		this.chat_manager.close(id);
	}

	is_recipient_blocked(recipient: PrivateParticipant): boolean {
		return this.chat_manager.is_recipient_blocked(recipient);
	}

	get_all_commands(priv: PrivateRoom): Array<string> {
		return this.chat_manager.get_all_commands(priv);
	}

	find_by_id(id: UserID): Option<PrivateRoom> {
		return this.chat_manager.get(id);
	}

	get_current_client_id(): UserID {
		return this.chat_manager.get_current_client_id();
	}

	get_current_client_nickname(): string {
		return this.chat_manager.get_current_client_nickname();
	}

	layout_settings() {
		return this.settings_manager.layout_settings();
	}

	personalization_settings() {
		return this.settings_manager.personalization_settings();
	}

	open_room(room_id: RoomID) {
		this.chat_manager.open_room(room_id);
	}

	send_to(id: UserID, message: string) {
		this.chat_manager.send_to(id, message);
	}

	ignore(nickname: Origin["nickname"]) {
		this.chat_manager.ignore(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.chat_manager.unignore(nickname);
	}
}
