<script setup lang="ts">
import { computed } from "vue";

import { use_chat_store, use_settings_store } from "~/store";

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

let chat_store = use_chat_store();
let settings_store = use_settings_store();

const emit = defineEmits<Emits>();

let navigation_bar_position = computed(
	() => settings_store.layout.navigation_bar_position,
);

let servers = computed(() => {
	let network = chat_store.store.network();
	return [
		{
			active: network.is_active(),
			connected: network.is_connected(),
			folded: false,
			id: network.id(),
			name: network.name,
			rooms: chat_store.store.room_manager().rooms(),
		},
	];
});

// ------- //
// Handler //
// ------- //

const open_settings_view_handler = () => emit("open-settings-view");

function change_room_handler(origin: Origin | RoomID)
{
	chat_store.change_room(origin);
}

function close_room_handler(origin: Origin | RoomID)
{
	chat_store.close_room(origin);
}

function open_channel_list_handler()
{
	chat_store.channel_list();
}
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="change_room_handler"
		@close-room="close_room_handler"
		@open-channel-list="open_channel_list_handler"
		@open-settings-view="open_settings_view_handler"
		:dir="navigation_bar_position === 'left' ? 'ltl' : 'rtl'"
		:style="{
			'--navigation-area-order': navigation_bar_position === 'right' && '1'
		}"
	/>
</template>
