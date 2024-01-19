<script setup lang="ts">
import { ChannelRoom } from "~/channel/ChannelRoom";
import {
	changeRoomHandler,
	closeRoomHandler,
	sendMessageHandler,
} from "./ChannelRoom.handlers";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";

// ---- //
// Type //
// ---- //

interface Props {
	room: ChannelRoom;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<ChannelRoomComponent
		:messages="room.messages"
		:name="room.name"
		:users="room.users"
		@close-room="closeRoomHandler"
		@open-private="changeRoomHandler"
		@send-message="sendMessageHandler"
	/>
</template>
