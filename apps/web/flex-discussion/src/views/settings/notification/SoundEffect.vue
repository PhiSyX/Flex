<script lang="ts" setup>
import type { NotificationData } from "@phisyx/flex-chat";

import { use_settings_store } from "~/store";

import { InputSwitchV2 } from "@phisyx/flex-vue-uikit";
import SettingsNotificationSoundEffect from "#/sys/settings_notification_sounds_effect/SettingsNotificationSoundEffect.template.vue";

let settings_store = use_settings_store();

function on_update(_: NotificationData["sounds"])
{
	settings_store.persist();
}
</script>

<template>
	<h2>
		<InputSwitchV2
			v-model="settings_store.notification.sounds.enabled"
			:checked="settings_store.notification.sounds.enabled"
			name="enabled_sounds_effects"
			position="right"
		>
			Effets sonores
		</InputSwitchV2>
	</h2>

	<SettingsNotificationSoundEffect
		v-model:sounds="settings_store.notification.sounds"
		:disabled="!settings_store.notification.sounds.enabled"
		@vue:updated="on_update"
	/>
</template>
