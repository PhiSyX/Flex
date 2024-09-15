<script lang="ts" setup>
import type { SettingsView } from "@phisyx/flex-chat-ui";

import SettingsLayoutNavigationBar from "#/sys/settings_layout_navigation_bar/SettingsLayoutNavigationBar.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	view: SettingsView;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<h2>Barre de navigation</h2>

	<SettingsLayoutNavigationBar v-model="view.navigation_bar_position_mut" />
</template>
