// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { LayoutData } from "../../../localstorage/settings_layout";
import type { NotificationData } from "../../../localstorage/settings_notification";
import type { PersonalizationData } from "../../../localstorage/settings_personalization";
import type { PrivateData } from "../../../localstorage/settings_private";
import type { SettingsStore } from "../../../store";
import type { Theme } from "../../../theme";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsSettingsManager {
	constructor(private store: SettingsStore) {}

	current_theme() {
		return this.store.get_personalization().theme;
	}

	persist() {
		this.store.persist();
	}

	get_position_of_navigation_bar() {
		return this.store.get_layout().navigation_bar_position;
	}
	set_position_of_navigation_bar($1: LayoutData["navigation_bar_position"]) {
		this.store.mut_layout((current) => ({
			...current,
			navigation_bar_position: $1,
		}));
	}
	get_channel_userlist_display() {
		return this.store.get_layout().channel_userlist_display;
	}
	set_channel_userlist_display($1: LayoutData["channel_userlist_display"]) {
		this.store.mut_layout((current) => ({
			...current,
			channel_userlist_display: $1,
		}));
	}
	get_channel_userlist_position() {
		return this.store.get_layout().channel_userlist_position;
	}
	set_channel_userlist_position($1: LayoutData["channel_userlist_position"]) {
		this.store.mut_layout((current) => ({
			...current,
			channel_userlist_position: $1,
		}));
	}

	get_sounds_effect() {
		return this.store.get_notification().sounds;
	}
	set_sounds_effect($1: NotificationData["sounds"]) {
		this.store.mut_notification((current) => ({
			...current,
			sounds: $1,
		}));
	}
	get_sounds_effect_enabled() {
		return this.store.get_notification().sounds.enabled;
	}
	set_sounds_effect_enabled($1: NotificationData["sounds"]["enabled"]) {
		this.store.mut_notification((current) => ({
			...current,
			sounds: {
				...current.sounds,
				enabled: $1,
			},
		}));
	}

	set_theme(name: keyof Theme) {
		this.store.mut_personalization((current) => ({
			...current,
			theme: name,
		}));
	}

	get_text_format_bold() {
		return this.store.get_personalization().formats.bold;
	}
	set_text_format_bold($1: PersonalizationData["formats"]["bold"]) {
		this.store.mut_personalization((current) => ({
			formats: { ...current.formats, bold: $1 },
		}));
	}
	get_text_format_italic() {
		return this.store.get_personalization().formats.italic;
	}
	set_text_format_italic($1: PersonalizationData["formats"]["italic"]) {
		this.store.mut_personalization((current) => ({
			formats: { ...current.formats, italic: $1 },
		}));
	}
	get_text_format_underline() {
		return this.store.get_personalization().formats.underline;
	}
	set_text_format_underline($1: PersonalizationData["formats"]["underline"]) {
		this.store.mut_personalization((current) => ({
			formats: { ...current.formats, underline: $1 },
		}));
	}

	get_text_color_background() {
		return this.store.get_personalization().colors.background;
	}
	set_text_color_background($1: PersonalizationData["colors"]["background"]) {
		this.store.mut_personalization((current) => ({
			colors: { ...current.formats, background: $1 },
		}));
	}
	get_text_color_foreground() {
		return this.store.get_personalization().colors.foreground;
	}
	set_text_color_foreground($1: PersonalizationData["colors"]["foreground"]) {
		this.store.mut_personalization((current) => ({
			colors: { ...current.formats, foreground: $1 },
		}));
	}

	get_waiting_private_list() {
		return this.store.get_private().waiting_list;
	}
	set_waiting_private_list($1: PrivateData["waiting_list"]) {
		this.store.mut_private((_current) => ({
			waiting_list: $1,
		}));
	}
}
