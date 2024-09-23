<script setup lang="ts">
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { Option } from "@phisyx/flex-safety";

import Menu from "@phisyx/flex-uikit-vue/menu/Menu.vue";
import MenuItem from "@phisyx/flex-uikit-vue/menu/MenuItem.vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	room: ChannelRoom;
	currentClientChannelMember: Option<ChannelMember>;
}

interface Emits {
	(event_name: "open-channel-settings"): void;
	(event_name: "part-channel"): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

// ------- //
// Handler //
// ------- //

const open_channel_settings_handler = () => emit("open-channel-settings");
const part_channel_handler = () => emit("part-channel");
</script>

<template>
	<Menu class="menu/channel-options">
		<MenuItem
			v-if="currentClientChannelMember.is_some()"
			@click="open_channel_settings_handler"
		>
			Paramètres du salon
		</MenuItem>

		<!--
		<hr />

		<MenuItem>Vérifier les mauvais pseudo</MenuItem>

		<MenuItem>Vérifier les logs d'un membre</MenuItem>
		-->

		<hr v-if="currentClientChannelMember.is_some()" />

		<MenuItem
			icon="close"
			style="background: var(--color-red500)"
			@click="part_channel_handler"
		>
			Partir du salon
		</MenuItem>
	</Menu>
</template>

<style scoped>
hr {
	border-width: 2px;
	border-color: var(--dialog-bg);
	margin: 0px;
}
</style>
