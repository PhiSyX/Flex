<script setup lang="ts">
import {
	closeRoomHandler,
	sendMessageHandler,
} from "./PrivateRoom.handlers";
import { type Props, computeMe, computeRecipient } from "./PrivateRoom.state";

import PrivateRoomComponent from "#/sys/private-room/PrivateRoom.vue";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const $me = computeMe(props);
const recipient = computeRecipient(props);
</script>

<template>
	<PrivateRoomComponent
		:messages="room.messages"
		:me="$me"
		:recipient="recipient"
		@close-room="closeRoomHandler"
		@send-message="sendMessageHandler"
	/>
</template>
