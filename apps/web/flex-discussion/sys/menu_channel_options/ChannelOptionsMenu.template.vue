<script setup lang="ts">
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { Option } from "@phisyx/flex-safety";

import UiMenu from "@phisyx/flex-uikit-vue/menu/Menu.vue";
import UiMenuItem from "@phisyx/flex-uikit-vue/menu/MenuItem.vue";

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
	<UiMenu class="menu/channel-options">
		<UiMenuItem
			v-if="currentClientChannelMember.is_some()"
			@click="open_channel_settings_handler"
		>
			Paramètres du salon
		</UiMenuItem>

		<!--
		<hr />

		<UiMenuItem>Vérifier les mauvais pseudo</UiMenuItem>

		<UiMenuItem>Vérifier les logs d'un membre</UiMenuItem>
		-->

		<hr v-if="currentClientChannelMember.is_some()" />

		<UiMenuItem
			icon="close"
			style="background: var(--color-red500)"
			@click="part_channel_handler"
		>
			Partir du salon
		</UiMenuItem>
	</UiMenu>
</template>

<style scoped>
hr {
	border-width: 2px;
	border-color: var(--dialog-bg);
	margin: 0px;
}
</style>
