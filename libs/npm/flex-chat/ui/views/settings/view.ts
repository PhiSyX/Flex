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
import type { Option } from "@phisyx/flex-safety/option";
import type { SettingsPresenter } from "./presenter";

import { View } from "@phisyx/flex-chat/view";
import { None } from "@phisyx/flex-safety/option";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsView {
	private presenter_ref: Option<SettingsPresenter> = None();

	maybe_selected_theme: Option<ThemeRecord> = None();
	themes!: Theme;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): SettingsPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: SettingsPresenter) {
		this.presenter_ref.replace($1);
	}

	get navigation_bar_position_mut() {
		return this.presenter.get_position_of_navigation_bar();
	}
	set navigation_bar_position_mut($1: LayoutData["navigation_bar_position"]) {
		this.presenter.set_position_of_navigation_bar($1);
	}
	get channel_userlist_display_mut() {
		return this.presenter.get_channel_userlist_display();
	}
	set channel_userlist_display_mut($1: LayoutData["channel_userlist_display"]) {
		this.presenter.set_channel_userlist_display($1);
	}
	get channel_userlist_position_mut() {
		return this.presenter.get_channel_userlist_position();
	}
	set channel_userlist_position_mut($1: LayoutData["channel_userlist_position"]) {
		this.presenter.set_channel_userlist_position($1);
	}
	get sounds_effect_mut() {
		return this.presenter.get_sounds_effect();
	}
	set sounds_effect_mut($1: NotificationData["sounds"]) {
		this.presenter.set_sounds_effect($1);
	}

	get sounds_effect_enabled() {
		return this.presenter.get_sounds_effect_enabled();
	}
	get sounds_effect_enabled_mut() {
		return this.sounds_effect_enabled;
	}
	set sounds_effect_enabled_mut($1: NotificationData["sounds"]["enabled"]) {
		this.presenter.set_sounds_effect_enabled($1);
	}

	get selected_theme() {
		return this.maybe_selected_theme.unwrap();
	}

	get waiting_private_list_mut() {
		return this.presenter.get_waiting_private_list();
	}
	set waiting_private_list_mut($1: PrivateData["waiting_list"]) {
		this.presenter.set_waiting_private_list($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	find_theme(fallback_theme?: keyof Theme) {
		return this.presenter.find_theme(fallback_theme);
	}

	define_themes(themes: Theme) {
		this.themes = themes;
	}

	set_current_theme() {
		this.maybe_selected_theme.replace(this.find_theme());
	}

	set_theme($1: ThemeRecord) {
		this.maybe_selected_theme.replace($1);
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	save = () => {
		this.presenter.persist();
	};

	save_and_exit_handler = () => {
		this.presenter.persist();

		if (this.presenter.is_active_room_server()) {
			this.presenter.router.goto(View.Chat);
			return;
		}

		this.presenter.router.back();
	};

	update_theme_handler = (name: keyof Theme) => {
		this.presenter.set_theme(name);
		this.set_current_theme();
	};
}
