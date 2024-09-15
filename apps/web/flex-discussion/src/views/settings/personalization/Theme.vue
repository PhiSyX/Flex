<script lang="ts" setup>
import type { ThemeRecord } from "@phisyx/flex-chat";
import type { SettingsView } from "@phisyx/flex-chat-ui";

import { computed, onActivated } from "vue";

import Match from "#/sys/match/Match.vue";
import SettingsPersonalizationTheme from "#/sys/settings_personalization_theme/SettingsPersonalizationTheme.template.vue";

import { THEMES } from "~/theme";

// ---- //
// Type //
// ---- //

interface Props {
	view: SettingsView;
}

// --------- //
// Composant //
// --------- //

const { view } = defineProps<Props>();
view.define_themes(THEMES);

let themes = Object.entries(THEMES) as Array<
	[name: ThemeRecord["name"], src: ThemeRecord["src"]]
>;

let maybe_selected_theme = computed(() => view.maybe_selected_theme);

// ---------- //
// Life cycle //
// ---------- //

onActivated(() => {
	view.set_current_theme();
});
</script>

<template>
	<h2>Choisir son thème</h2>

	<Match :maybe="maybe_selected_theme">
		<template #some="{ data: selected_theme }">
			<SettingsPersonalizationTheme
				:list="themes"
				:selected="selected_theme"
				@update="view.update_theme_handler"
			/>
		</template>
	</Match>
</template>
