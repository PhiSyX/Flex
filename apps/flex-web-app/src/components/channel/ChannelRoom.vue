<script setup lang="ts">
import {
	compute$me,
	computeSelectedUser,
	type Props,
} from "./ChannelRoom.state";

import {
	closeRoomHandler,
	ignoreUserHandler,
	openPrivateHandler,
	toggleSelectedUser,
	sendMessageHandler,
	unignoreUserHandler,
} from "./ChannelRoom.handlers";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const $me = compute$me(props);
const selectedUser = computeSelectedUser(props);

const toggleSelectedUserHandler = toggleSelectedUser(props);
</script>

<template>
	<ChannelRoomComponent
		:me="$me"
		:messages="room.messages"
		:name="room.name"
		:users="room.users"
		:selected-user="selectedUser"
		@close-room="closeRoomHandler"
		@ignore-user="ignoreUserHandler"
		@unignore-user="unignoreUserHandler"
		@open-private="openPrivateHandler"
		@select-user="toggleSelectedUserHandler"
		@send-message="sendMessageHandler"
	/>
</template>
