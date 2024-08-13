<script setup lang="ts">
import type { ChannelRoom } from "@phisyx/flex-chat";

import { computed } from "vue";
import { useRoute as use_route } from "vue-router";

import { use_chat_store } from "~/store";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();

let chat_store = use_chat_store();

let room = computed(() => chat_store.store.room_manager()
    .get(route.params.channelname as ChannelID)
    .as<ChannelRoom>()
);
</script>

<template>
	<Match :maybe="room">
        <template #some="{ data: room }">
		    <ChannelRoomComponent :room="room" class="[ flex:full ]"/>
        </template>
	</Match>
</template>
