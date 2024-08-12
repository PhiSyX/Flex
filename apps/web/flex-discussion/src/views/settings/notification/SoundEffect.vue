<script lang="ts" setup>
import type { NotificationData } from "@phisyx/flex-chat";

import SettingsNotificationSoundEffect from "#/sys/settings_notification_sounds_effect/SettingsNotificationSoundEffect.template.vue";

import { use_settings_store } from "~/store";

let settings_store = use_settings_store();

function on_update(_: NotificationData["sounds"])
{
	settings_store.persist();
}
</script>

<template>
	<h2>Effets sonores</h2>

	<SettingsNotificationSoundEffect
		v-model:sounds="settings_store.notification.sounds"
		@vue:updated="on_update"
	/>
</template>
