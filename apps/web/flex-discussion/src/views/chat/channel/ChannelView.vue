<script setup lang="ts">
import type { ChannelView } from "@phisyx/flex-chat-ui/views/channel";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
} from "@phisyx/flex-chat/store";

import { ChannelWireframe } from "@phisyx/flex-chat-ui/views/channel";
import { computed, onMounted, reactive } from "vue";
import { VueRouter } from "~/router";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
} from "~/store";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";

import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;

let view = reactive(
	ChannelWireframe.create(
		new VueRouter(),
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
	),
) as ChannelView;

let maybe_channel = computed(() => view.maybe_channel);

// ---------- //
// Life cycle //
// ---------- //

onMounted(() => {
	view.set_channel_from_route_param();
});
</script>

<template>
	<Match :maybe="maybe_channel">
		<template #some="{ data: channel }">
			<ChannelRoomComponent
				:room="channel"
				:view="view"
				class="[ flex:full ]"
			/>
		</template>
	</Match>
</template>
