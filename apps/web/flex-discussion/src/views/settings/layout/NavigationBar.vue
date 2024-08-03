<script lang="ts" setup>
import SettingsLayoutNavigationBar from "#/sys/settings_layout_navigation_bar/SettingsLayoutNavigationBar.template.vue";

import { useSettingsStore } from "~/store";

let settings_store = useSettingsStore();
</script>

<template>
	<h2>Barre de navigation</h2>

	<SettingsLayoutNavigationBar
		v-model="settings_store.layout.navigationBarPosition"
	/>
</template>
