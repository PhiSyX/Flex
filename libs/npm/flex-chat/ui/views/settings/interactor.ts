// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { LayoutData } from "@phisyx/flex-chat/localstorage/settings_layout";
import type { NotificationData } from "@phisyx/flex-chat/localstorage/settings_notification";
import type { PrivateData } from "@phisyx/flex-chat/localstorage/settings_private";
import type { Theme } from "@phisyx/flex-chat/theme";
import type { Option } from "@phisyx/flex-safety";
import type { SettingsChatManager } from "./datamanager/chat_data_manager";
import type { SettingsSettingsManager } from "./datamanager/settings_data_manager";
import type { SettingsPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsInteractor {
	constructor(
		presenter: SettingsPresenter,
		datamanager: [
			chat: SettingsChatManager,
			settings: SettingsSettingsManager,
		],
	) {
		this.presenter = presenter;
		this.presenter.interactor = this;

		this.chat_manager = datamanager[0];
		this.settings_manager = datamanager[1];
	}

	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<SettingsPresenter> = None();
	private chat_manager!: SettingsChatManager;
	private settings_manager!: SettingsSettingsManager;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): SettingsPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: SettingsPresenter) {
		this.presenter_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	current_theme() {
		return this.settings_manager.current_theme();
	}

	is_active_room_server() {
		return this.chat_manager.is_active_room_server();
	}

	persist() {
		this.settings_manager.persist();
	}

	get_position_of_navigation_bar() {
		return this.settings_manager.get_position_of_navigation_bar();
	}
	set_position_of_navigation_bar($1: LayoutData["navigation_bar_position"]) {
		this.settings_manager.set_position_of_navigation_bar($1);
	}
	get_channel_userlist_display() {
		return this.settings_manager.get_channel_userlist_display();
	}
	set_channel_userlist_display($1: LayoutData["channel_userlist_display"]) {
		this.settings_manager.set_channel_userlist_display($1);
	}
	get_channel_userlist_position() {
		return this.settings_manager.get_channel_userlist_position();
	}
	set_channel_userlist_position($1: LayoutData["channel_userlist_position"]) {
		this.settings_manager.set_channel_userlist_position($1);
	}

	get_sounds_effect() {
		return this.settings_manager.get_sounds_effect();
	}
	set_sounds_effect($1: NotificationData["sounds"]) {
		this.settings_manager.set_sounds_effect($1);
	}
	get_sounds_effect_enabled() {
		return this.settings_manager.get_sounds_effect_enabled();
	}
	set_sounds_effect_enabled($1: NotificationData["sounds"]["enabled"]) {
		this.settings_manager.set_sounds_effect_enabled($1);
	}

	get_waiting_private_list() {
		return this.settings_manager.get_waiting_private_list();
	}
	set_waiting_private_list($1: PrivateData["waiting_list"]) {
		this.settings_manager.set_waiting_private_list($1);
	}

	set_theme(name: keyof Theme) {
		this.settings_manager.set_theme(name);
	}
}
