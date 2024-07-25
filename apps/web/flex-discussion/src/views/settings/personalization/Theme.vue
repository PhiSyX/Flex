<script lang="ts" setup>
import { onActivated, shallowRef } from "vue";

import SettingsPersonalizationTheme from "#/sys/settings_personalization_theme/SettingsPersonalizationTheme.vue";

import {
	THEMES,
	type Theme,
	type ThemeRecord,
	findTheme,
	setThemeLS,
} from "~/theme";

const themes = Object.entries(THEMES) as Array<
	[ThemeRecord["name"], ThemeRecord["src"]]
>;
const selectedTheme = shallowRef(findTheme());

function updateTheme(name: string) {
	setThemeLS(name as keyof Theme);
	selectedTheme.value = findTheme();
}

onActivated(() => {
	selectedTheme.value = findTheme();
});
</script>

<template>
	<h2>Choisir son thème</h2>

	<SettingsPersonalizationTheme
		:list="themes"
		:selected="selectedTheme"
		@update="updateTheme"
	/>
</template>
