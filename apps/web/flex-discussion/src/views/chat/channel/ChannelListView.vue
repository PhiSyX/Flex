<script setup lang="ts">
import type { ChatStoreInterface, OverlayerStore } from "@phisyx/flex-chat";
import type { ChannelListView } from "@phisyx/flex-chat-ui";

import { ChannelListWireframe } from "@phisyx/flex-chat-ui";
import { Match } from "@phisyx/flex-vue-uikit";
import { computed, onMounted, reactive } from "vue";

import { VueRouter } from "~/router";
import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelList from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";

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
