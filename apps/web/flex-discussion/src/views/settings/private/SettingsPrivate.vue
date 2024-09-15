<script lang="ts" setup>
import type { SettingsView } from "@phisyx/flex-chat-ui";

import SettingsPrivate from "#/sys/settings_private/SettingsPrivate.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	view: SettingsView;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<SettingsPrivate v-model:waiting-list="view.waiting_private_list_mut" />
</template>
