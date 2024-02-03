<script setup lang="ts">
import {
	changeNickRequestHandler,
	closeRoomHandler,
	ignoreUserHandler,
	sendMessageHandler,
	unignoreUserHandler,
} from "./PrivateRoom.handlers";

import {
	type Props,
	computeMe,
	computeRecipient,
	computeRecipientIsBlocked,
	myNick,
} from "./PrivateRoom.state";

import PrivateRoomComponent from "#/sys/private-room/PrivateRoom.vue";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const $me = computeMe(props);
const recipient = computeRecipient(props);
const recipientIsBlocked = computeRecipientIsBlocked(recipient.value);
</script>

<template>
	<PrivateRoomComponent
		:current-nick="myNick"
		:disable-input="recipientIsBlocked"
		:input-history="room.inputHistory"
		:me="$me"
		:messages="room.messages"
		:recipient="recipient"
		@change-nick-request="changeNickRequestHandler"
		@close-room="closeRoomHandler"
		@ignore-user="ignoreUserHandler"
		@send-message="sendMessageHandler"
		@unignore-user="unignoreUserHandler"
	/>
</template>
