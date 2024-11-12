<script setup lang="ts">
import type { ChannelListView } from "@phisyx/flex-chat-ui/views/channel_list";
import type { ChatStoreInterface } from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";

import { ChannelListWireframe } from "@phisyx/flex-chat-ui/views/channel_list";
import { computed, onMounted, reactive } from "vue";
import { VueRouter } from "~/router";
import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelList from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";
import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;

let view = reactive(
	ChannelListWireframe.create(
		new VueRouter(),
		chat_store as unknown as ChatStoreInterface,
		overlayer_store as OverlayerStore,
	),
) as ChannelListView;

let maybe_servername = computed(() => view.maybe_servername);

// ---------- //
// Life cycle //
// ---------- //

onMounted(() => {
	view.set_servername_from_route_param();
});
</script>

<template>
	<Match :maybe="maybe_servername">
		<template #some="{ data: servername }">
			<ChannelList
				:channels="view.list"
				:servername="servername"
				class="[ flex:full ]"
				@join-channel="view.join_channel_handler"
				@create-channel-dialog="view.open_join_channel_dialog_handler"
			/>
		</template>
	</Match>
</template>
