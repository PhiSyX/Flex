<script setup lang="ts">
import { computed } from "vue";
import { useRouter as use_router } from "vue-router";

import { View } from "@phisyx/flex-chat/view";

import { use_chat_store, use_settings_store } from "~/store";

import NavigationArea from "#/sys/navigation_area/NavigationArea.template.vue";

// --------- //
// Composant //
// --------- //

let router = use_router();

let chat_store = use_chat_store();
let settings_store = use_settings_store();

let navigation_bar_position = computed(() =>
	settings_store.layout.navigation_bar_position === "left" ? "ltl" : "rtl",
);

// ------- //
// Handler //
// ------- //

function open_settings_view_handler() {
	router.push({ name: View.Settings });
}

function change_room_handler(origin: Origin | RoomID) {
	chat_store.change_room(origin);
}

function close_room_handler(origin: Origin | RoomID) {
	chat_store.close_room(origin);
}

function open_channel_list_handler() {
	chat_store.channel_list();
}

function open_private_list_view_handler() {
	router.push({ name: View.PrivateList });
}
</script>

<template>
	<NavigationArea
		:total-privates-waiting="chat_store.privates_waiting.length"
		:servers="chat_store.servers"
		@change-room="change_room_handler"
		@close-room="close_room_handler"
		@open-channel-list="open_channel_list_handler"
		@open-private-list="open_private_list_view_handler"
		@open-settings-view="open_settings_view_handler"
		:dir="navigation_bar_position"
		:style="{
			'--navigation-area-order': navigation_bar_position === 'rtl' && '1'
		}"
	/>
</template>
