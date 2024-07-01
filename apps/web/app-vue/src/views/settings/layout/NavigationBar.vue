<script lang="ts" setup>
import SettingsLayoutNavigationBar from "#/sys/settings_layout_navigation_bar/SettingsLayoutNavigationBar.vue";

import { useSettingsStore } from "~/storage/memory/settings";

const settingsStore = useSettingsStore();
</script>

<template>
	<h2>Barre de navigation</h2>

	<SettingsLayoutNavigationBar
		v-model="settingsStore.layout.navigationBarPosition"
	/>
</template>
