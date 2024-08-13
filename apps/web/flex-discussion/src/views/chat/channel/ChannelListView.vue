<script setup lang="ts">
import { computed } from "vue";
import { useRouter as use_router } from "vue-router";

import { ChannelJoinDialog, View } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelList from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";

// --------- //
// Composant //
// --------- //

let router = use_router();

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

const channels = computed(() => chat_store.store.get_channel_list());

// ------- //
// Handler //
// ------- //

function join_channel_handler(name: ChannelID)
{
	chat_store.join_channel(name);
	chat_store.change_room(name);
	router.push({ name: View.Chat });
}

function open_join_channel_dialog_handler(event: Event)
{
	ChannelJoinDialog.create(overlayer_store.store, { event });
}
</script>

<template>
	<ChannelList
		:channels="channels"
		class="[ flex:full ]"
		@join-channel="join_channel_handler"
		@create-channel-dialog="open_join_channel_dialog_handler"
	/>
</template>
