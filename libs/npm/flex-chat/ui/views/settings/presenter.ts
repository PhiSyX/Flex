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
import type { Theme, ThemeRecord } from "@phisyx/flex-chat/theme";
import type { Option } from "@phisyx/flex-safety";
import type { SettingsInteractor } from "./interactor";
import type { SettingsRouter } from "./router";
import type { SettingsView } from "./view";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsPresenter {
	static DEFAULT_THEME: keyof Theme = "ice";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public router: SettingsRouter,
		public view: SettingsView,
	) {
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<SettingsInteractor> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): SettingsInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: SettingsInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	find_theme(fallback_theme = SettingsPresenter.DEFAULT_THEME): ThemeRecord {
		let theme_ls = this.interactor.current_theme() || fallback_theme;
		let theme_found = this.view.themes[theme_ls];
		if (!theme_found) {
			return {
				name: fallback_theme,
				src: this.view.themes[fallback_theme],
			};
		}
		return {
			name: theme_ls,
			src: theme_found,
		};
	}

	is_active_room_server() {
		return this.interactor.is_active_room_server();
	}

	persist() {
		this.interactor.persist();
	}

	get_position_of_navigation_bar() {
		return this.interactor.get_position_of_navigation_bar();
	}
	set_position_of_navigation_bar($1: LayoutData["navigation_bar_position"]) {
		this.interactor.set_position_of_navigation_bar($1);
	}
	get_channel_userlist_display() {
		return this.interactor.get_channel_userlist_display();
	}
	set_channel_userlist_display($1: LayoutData["channel_userlist_display"]) {
		this.interactor.set_channel_userlist_display($1);
	}
	get_channel_userlist_position() {
		return this.interactor.get_channel_userlist_position();
	}
	set_channel_userlist_position($1: LayoutData["channel_userlist_position"]) {
		this.interactor.set_channel_userlist_position($1);
	}

	get_sounds_effect() {
		return this.interactor.get_sounds_effect();
	}
	set_sounds_effect($1: NotificationData["sounds"]) {
		this.interactor.set_sounds_effect($1);
	}
	get_sounds_effect_enabled() {
		return this.interactor.get_sounds_effect_enabled();
	}
	set_sounds_effect_enabled($1: NotificationData["sounds"]["enabled"]) {
		this.interactor.set_sounds_effect_enabled($1);
	}

	get_waiting_private_list() {
		return this.interactor.get_waiting_private_list();
	}
	set_waiting_private_list($1: PrivateData["waiting_list"]) {
		this.interactor.set_waiting_private_list($1);
	}

	set_theme(name: keyof Theme) {
		this.interactor.set_theme(name);
		document.documentElement.dataset["scheme"] = name;
	}
}
