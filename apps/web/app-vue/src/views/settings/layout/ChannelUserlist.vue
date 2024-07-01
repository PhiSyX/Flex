<script lang="ts" setup>
import SettingsLayoutChannelUserlist from "#/sys/settings_layout_channel_userlist/SettingsLayoutChannelUserlist.vue";

import { useSettingsStore } from "~/storage/memory/settings";

const settingsStore = useSettingsStore();
</script>

<template>
	<h2>Liste des utilisateurs de salon</h2>

	<SettingsLayoutChannelUserlist
		v-model:display="settingsStore.layout.channelUserlistDisplay"
		v-model:position="settingsStore.layout.channelUserlistPosition"
	/>
</template>
