<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat";

import { computed } from "vue";
import { useRoute as use_route } from "vue-router";

import { use_chat_store } from "~/store";

import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();

let chat_store = use_chat_store();

let room = computed(() =>
	chat_store.store
		.room_manager()
		.get(route.params.id as UserID)
		.as<PrivateRoom>()
);
</script>

<template>
	<Match :maybe="room">
		<template #some="{ data: room }">
			<PrivateRoomComponent :room="room" class="[ flex:full ]" />
		</template>
	</Match>
</template>
