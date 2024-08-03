<script lang="ts" setup>
import { onActivated as on_activated, shallowRef as shallow_ref } from "vue";

import SettingsPersonalizationTheme from "#/sys/settings_personalization_theme/SettingsPersonalizationTheme.template.vue";

import {
	THEMES,
	type Theme,
	type ThemeRecord,
	find_theme,
	set_theme_ls,
} from "~/theme";

// --------- //
// Composant //
// --------- //

let themes = Object.entries(THEMES) as Array<
	[ThemeRecord["name"], ThemeRecord["src"]]
>;
let selected_theme = shallow_ref(find_theme());

// --------- //
// Lifecycle // -> Hooks
// --------- //

on_activated(() => {
	selected_theme.value = find_theme();
});

// ------- //
// Handler //
// ------- //

function update_theme_handler(name: string) 
{
	set_theme_ls(name as keyof Theme);
	selected_theme.value = find_theme();
}
</script>

<template>
	<h2>Choisir son thème</h2>

	<SettingsPersonalizationTheme
		:list="themes"
		:selected="selected_theme"
		@update="update_theme_handler"
	/>
</template>
