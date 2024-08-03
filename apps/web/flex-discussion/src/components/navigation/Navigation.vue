<script setup lang="ts">
import { computed } from "vue";

import { useChatStore, useSettingsStore } from "~/store";

import NavigationArea from "#/sys/navigation_area/NavigationArea.template.vue";

// ---- //
// Type //
// ---- //

interface Emits 
{
	// biome-ignore lint/style/useShorthandFunctionType: ?
	(event_name: "open-settings-view"): void;
}

// --------- //
// Composant //
// --------- //

let chat_store = useChatStore();
let settings_store = useSettingsStore();

const emit = defineEmits<Emits>();

let navigationBarPosition = computed(
	() => settings_store.layout.navigationBarPosition,
);

let servers = computed(() => {
	let network = chat_store.store.network();
	return [
		{
			active: network.isActive(),
			connected: network.isConnected(),
			folded: false,
			id: network.id(),
			name: network.name,
			rooms: chat_store.store.roomManager().rooms(),
		},
	];
});

// ------- //
// Handler //
// ------- //

const open_settings_view_handler = () => ("open-settings-view");

function change_room_handler(origin: Origin | RoomID) 
{
	chat_store.changeRoom(origin);
}

function close_room_handler(origin: Origin | RoomID) 
{
	chat_store.closeRoom(origin);
}

function open_channel_list_handler() 
{
	chat_store.channelList();
}
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="change_room_handler"
		@close-room="close_room_handler"
		@open-channel-list="open_channel_list_handler"
		@open-settings-view="open_settings_view_handler"
		:dir="navigationBarPosition === 'left' ? 'ltl' : 'rtl'"
		:style="{
			'--navigation-area-order': navigationBarPosition === 'right' && '1'
		}"
	/>
</template>
