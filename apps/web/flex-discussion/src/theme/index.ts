// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Theme, ThemeRecord } from "@phisyx/flex-chat";

import { onMounted as on_mounted } from "vue";

import { use_settings_store } from "~/store";

import theme_dark_image from "#/assets/img/theme-dark.jpg";
import theme_ice_image from "#/assets/img/theme-ice.jpg";
import theme_light_image from "#/assets/img/theme-light.jpg";
import theme_system_image from "#/assets/img/theme-system.jpg";

export type { Theme, ThemeRecord };

// -------- //
// Constant //
// -------- //

export const THEMES: Theme = {
	dark: theme_dark_image,
	light: theme_light_image,
	system: theme_system_image,
	ice: theme_ice_image,
};

const DEFAULT_THEME: keyof Theme = "ice";

// -------- //
// Fonction //
// -------- //

export function find_theme(fallback_theme = DEFAULT_THEME): ThemeRecord {
	let settings_store = use_settings_store();

	let theme_ls = settings_store.personalization.theme || fallback_theme;
	let theme_found = THEMES[theme_ls];

	if (!theme_found) {
		return {
			name: fallback_theme,
			src: THEMES[fallback_theme],
		};
	}

	return {
		name: theme_ls,
		src: theme_found,
	};
}

export function set_theme_ls(name: keyof Theme) {
	let settings_store = use_settings_store();
	document.documentElement.dataset["scheme"] = name;
	settings_store.theme_mut = name;
}

export function find_theme_name(fallback_theme = DEFAULT_THEME) {
	return find_theme(fallback_theme).name;
}

export function use_theme() {
	on_mounted(() => set_theme_ls(find_theme_name()));
}
