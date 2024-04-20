<script lang="ts" setup>
import SettingsLayoutNavigationBar from "#/sys/settings-layout-navigation-bar/SettingsLayoutNavigationBar.vue";

import { useSettingsStore } from "~/store/SettingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
	<h2>Barre de navigation</h2>

	<SettingsLayoutNavigationBar
		v-model="settingsStore.layout.navigationBarPosition"
	/>
</template>
