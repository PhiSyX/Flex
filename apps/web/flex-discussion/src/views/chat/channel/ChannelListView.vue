<script setup lang="ts">
import { computed } from "vue";
import { useRoute as use_route } from "vue-router";

import { ChannelJoinDialog } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelList from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();
let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

const channels = computed(() => chat_store.store.get_channel_list());
const servername = computed(() => {
	let server = chat_store.store.room_manager()
		.get(route.params.servername as RoomID)
		.unwrap();
	return server.name;
});

// ------- //
// Handler //
// ------- //

function join_channel_handler(name: ChannelID)
{
	chat_store.join_channel(name);
	chat_store.change_room(name);
}

function open_join_channel_dialog_handler(event: Event)
{
	ChannelJoinDialog.create(overlayer_store.store, { event });
}
</script>

<template>
	<ChannelList
		:channels="channels"
		:servername="servername"
		class="[ flex:full ]"
		@join-channel="join_channel_handler"
		@create-channel-dialog="open_join_channel_dialog_handler"
	/>
</template>
