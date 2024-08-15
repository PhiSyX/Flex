<script setup lang="ts">
import type { ChannelRoom } from "@phisyx/flex-chat";

import { onMounted as on_mounted, shallowRef as shallow_ref } from "vue";
import { useRoute as use_route, } from "vue-router";

import { None } from "@phisyx/flex-safety";
import { Match } from "@phisyx/flex-vue-uikit";

import { use_chat_store } from "~/store";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();

let chat_store = use_chat_store();

let room = shallow_ref(None().as<ChannelRoom>());

on_mounted(() => {
	room.value = chat_store.store.room_manager()
		.get(route.params.channelname as ChannelID || "")
		.as<ChannelRoom>();
});
</script>

<template>
	<Match :maybe="room">
		<template #some="{ data: room }">
			<ChannelRoomComponent :room="room" class="[ flex:full ]"/>
		</template>
	</Match>
</template>
