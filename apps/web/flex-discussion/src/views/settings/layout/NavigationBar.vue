<script lang="ts" setup>
import SettingsLayoutNavigationBar from "#/sys/settings_layout_navigation_bar/SettingsLayoutNavigationBar.template.vue";

import { use_settings_store } from "~/store";

let settings_store = use_settings_store();
</script>

<template>
	<h2>Barre de navigation</h2>

	<SettingsLayoutNavigationBar
		v-model="settings_store.layout.navigation_bar_position"
	/>
</template>
