<script lang="ts" setup>
import type { SettingsView } from "@phisyx/flex-chat-ui/views/settings";

import { computed } from "vue";

import InputSwitch from "@phisyx/flex-uikit-vue/input/InputSwitch.vue";

import SettingsNotificationSoundEffect from "#/sys/settings_notification_sounds_effect/SettingsNotificationSoundEffect.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	view: SettingsView;
}

// --------- //
// Composant //
// --------- //

const { view } = defineProps<Props>();

let sounds_effect_enabled = computed(() => view.sounds_effect_enabled);
</script>

<template>
	<h2>
		<InputSwitch
			v-model="view.sounds_effect_enabled_mut"
			name="enabled_sounds_effects"
			position="right"
		>
			Effets sonores
		</InputSwitch>
	</h2>

	<SettingsNotificationSoundEffect
		v-model:sounds="view.sounds_effect_mut"
		:disabled="!sounds_effect_enabled"
		@vue:updated="view.save"
	/>
</template>
