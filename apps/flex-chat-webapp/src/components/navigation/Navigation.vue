<script setup lang="ts">
import { computed } from "vue";

import { useChatStore } from "~/storage/memory/chat";
import { useSettingsStore } from "~/storage/memory/settings";

import NavigationArea from "#/sys/navigation_area/NavigationArea.vue";

// ---- //
// Type //
// ---- //

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: ?
	(evtName: "open-settings-view"): void;
}

// --------- //
// Composant //
// --------- //

const chatStore = useChatStore();
const settingsStore = useSettingsStore();

const emit = defineEmits<Emits>();

const navigationBarPosition = computed(
	() => settingsStore.layout.navigationBarPosition,
);

const servers = computed(() => {
	const network = chatStore.store.network();
	return [
		{
			active: network.isActive(),
			connected: network.isConnected(),
			folded: false,
			id: network.id(),
			name: network.name,
			rooms: chatStore.store.roomManager().rooms(),
		},
	];
});

function changeRoom(origin: Origin | RoomID) {
	chatStore.changeRoom(origin);
}

function closeRoom(origin: Origin | RoomID) {
	chatStore.closeRoom(origin);
}

function openChannelList() {
	chatStore.channelList();
}

function openSettingsView() {
	emit("open-settings-view");
}
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="changeRoom"
		@close-room="closeRoom"
		@open-channel-list="openChannelList"
		@open-settings-view="openSettingsView"
		:dir="navigationBarPosition === 'left' ? 'ltl' : 'rtl'"
		:style="{
			'--navigation-area-order': navigationBarPosition === 'right' && '1'
		}"
	/>
</template>
