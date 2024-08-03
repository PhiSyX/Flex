<script lang="ts" setup>
import SettingsLayoutChannelUserlist from "#/sys/settings_layout_channel_userlist/SettingsLayoutChannelUserlist.template.vue";

import { useSettingsStore } from "~/store";

let settings_store = useSettingsStore();
</script>

<template>
	<h2>Liste des utilisateurs de salon</h2>

	<SettingsLayoutChannelUserlist
		v-model:display="settings_store.layout.channelUserlistDisplay"
		v-model:position="settings_store.layout.channelUserlistPosition"
	/>
</template>
