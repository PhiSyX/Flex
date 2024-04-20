<script lang="ts" setup>
import SettingsLayoutChannelUserlist from "#/sys/settings-layout-channel-userlist/SettingsLayoutChannelUserlist.vue";

import { useSettingsStore } from "~/store/SettingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
	<h2>Liste des utilisateurs de salon</h2>

	<SettingsLayoutChannelUserlist
		v-model:display="settingsStore.layout.channelUserlistDisplay"
		v-model:position="settingsStore.layout.channelUserlistPosition"
	/>
</template>
