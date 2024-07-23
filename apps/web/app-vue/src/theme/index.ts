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
import { onMounted } from "vue";

import { useSettingsStore } from "~/store";
import themeDarkImage from "#/assets/img/theme-dark.jpg";
import themeIceImage from "#/assets/img/theme-ice.jpg";
import themeLightImage from "#/assets/img/theme-light.jpg";
import themeSystemImage from "#/assets/img/theme-system.jpg";

export type { Theme, ThemeRecord } from "@phisyx/flex-chat";

// -------- //
// Constant //
// -------- //

export const THEMES: Theme = {
	dark: themeDarkImage,
	light: themeLightImage,
	system: themeSystemImage,
	ice: themeIceImage,
};

const DEFAULT_THEME: keyof Theme = "ice";

// -------- //
// Fonction //
// -------- //

export function findTheme(fallbackTheme = DEFAULT_THEME): ThemeRecord {
	const settingsStore = useSettingsStore();

	const themeLS = settingsStore.personalization.theme || fallbackTheme;
	const themeFound = THEMES[themeLS];

	if (!themeFound) {
		return {
			name: fallbackTheme,
			src: THEMES[fallbackTheme],
		};
	}

	return {
		name: themeLS,
		src: themeFound,
	};
}

export function setThemeLS(name: keyof Theme) {
	const settingsStore = useSettingsStore();
	document.documentElement.dataset["scheme"] = name;
	settingsStore.personalization.theme = name;
}

export function findThemeName(fallbackTheme = DEFAULT_THEME) {
	return findTheme(fallbackTheme).name;
}

export function useTheme() {
	onMounted(() => setThemeLS(findThemeName()));
}
