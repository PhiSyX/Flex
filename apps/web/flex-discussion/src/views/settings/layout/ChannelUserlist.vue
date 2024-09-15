<script lang="ts" setup>
import type { SettingsView } from "@phisyx/flex-chat-ui";

import SettingsLayoutChannelUserlist from "#/sys/settings_layout_channel_userlist/SettingsLayoutChannelUserlist.template.vue";

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
	<h2>Liste des utilisateurs de salon</h2>

	<SettingsLayoutChannelUserlist
		v-model:display="view.channel_userlist_display_mut"
		v-model:position="view.channel_userlist_position_mut"
	/>
</template>
