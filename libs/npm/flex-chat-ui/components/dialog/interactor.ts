// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { UserSession } from "@phisyx/flex-chat/user/session";
import type { DialogChatManager } from "./datamanager/chat_data_manager";
import type { DialogOverlayerManager } from "./datamanager/overlayer_data_manager";
import type { DialogSettingsManager } from "./datamanager/settings_data_manager";
import type { DialogUserManager } from "./datamanager/user_data_manager";
import type { DialogPresenter } from "./presenter";

// -------------- //
// Implémentation //
// -------------- //

export class DialogInteractor {
	constructor(
		presenter: DialogPresenter,
		datamanager: [
			chat: DialogChatManager,
			overlayer: DialogOverlayerManager,
			settings: DialogSettingsManager,
			user: DialogUserManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.overlayer_manager = datamanager[1];
		this.settings_manager = datamanager[2];
		this.user_manager = datamanager[3];
	}

	// --------- //
	// Propriété //
	// --------- //

	presenter: DialogPresenter;

	private chat_manager!: DialogChatManager;
	private overlayer_manager!: DialogOverlayerManager;
	private settings_manager!: DialogSettingsManager;
	private user_manager!: DialogUserManager;

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	destroy_dialog(id: string) {
		return this.overlayer_manager.destroy_dialog(id);
	}

	has_data_dialog(id: string) {
		return this.overlayer_manager.has_data_dialog(id);
	}

	get_data_dialog(id: string) {
		return this.overlayer_manager.get_data_dialog(id);
	}

	update_dialog(id: string) {
		return this.overlayer_manager.update_dialog(id);
	}

	is_dialog_exists(id: string) {
		return this.overlayer_manager.is_dialog_exists(id);
	}

	layout_settings() {
		return this.settings_manager.layout_settings();
	}

	personalization_settings() {
		return this.settings_manager.personalization_settings();
	}

	join(names: ChannelID, keys: string) {
		this.chat_manager.join(names, keys);
	}

	change_nick(nickname: string) {
		this.chat_manager.change_nick(nickname);
	}

	apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	) {
		this.chat_manager.apply_channel_settings(target, modes_settings);
	}

	accept_participant(participant: PrivateParticipant) {
		this.chat_manager.accept_participant(participant);
	}
	decline_participant(participant: PrivateParticipant) {
		this.chat_manager.decline_participant(participant);
	}

	update_topic(channel_name: ChannelID, topic?: string) {
		this.chat_manager.update_topic(channel_name, topic);
	}

	patch_user_account(user_id: UserSession["id"], form_data: FormData) {
		this.user_manager.patch_account(user_id, form_data);
	}

	unset_session_user() {
		this.user_manager.unset_session_user();
	}
}
