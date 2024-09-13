<script lang="ts" setup>
import { use_settings_store } from "~/store";

import SettingsPrivate from "#/sys/settings_private/SettingsPrivate.template.vue";

let settings_store = use_settings_store();
</script>

<template>
	<SettingsPrivate
		v-model:waiting-list="settings_store.waiting_private_list_mut"
	/>
</template>
