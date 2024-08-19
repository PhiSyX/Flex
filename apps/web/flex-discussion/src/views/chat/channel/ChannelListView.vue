<script setup lang="ts">
import type { OverlayerStore } from "@phisyx/flex-chat";

import { onMounted as on_mounted, shallowRef as shallow_ref } from "vue";
import { useRoute as use_route } from "vue-router";

import { ChannelJoinDialog } from "@phisyx/flex-chat";
import { None } from "@phisyx/flex-safety";
import { Match } from "@phisyx/flex-vue-uikit";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelList from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();
let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let servername = shallow_ref(None().as<string>());

on_mounted(() => {
	servername.value = chat_store.room_manager()
		.get(route.params.servername as RoomID)
		.map((r) => r.name);
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
	ChannelJoinDialog.create(overlayer_store.store as OverlayerStore, { event });
}
</script>

<template>
	<Match :maybe="servername">
		<template #some="{ data: servername }">
			<ChannelList
				:channels="chat_store.channels_list_arr"
				:servername="servername"
				class="[ flex:full ]"
				@join-channel="join_channel_handler"
				@create-channel-dialog="open_join_channel_dialog_handler"
			/>
		</template>
	</Match>
</template>
