<script lang="ts" setup>
import SettingsLayoutChannelUserlist from "#/sys/settings_layout_channel_userlist/SettingsLayoutChannelUserlist.template.vue";

import { use_settings_store } from "~/store";

let settings_store = use_settings_store();
</script>

<template>
	<h2>Liste des utilisateurs de salon</h2>

	<SettingsLayoutChannelUserlist
		v-model:display="settings_store.layout.channel_userlist_display"
		v-model:position="settings_store.layout.channel_userlist_position"
	/>
</template>
