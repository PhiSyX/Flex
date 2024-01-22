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
	updateTopicHandler,
} from "./ChannelRoom.handlers";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";
import { computed } from "vue";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const $me = compute$me(props);
const selectedUser = computeSelectedUser(props);

const canEditTopic = computed(() => props.room.canEditTopic($me.value));
const toggleSelectedUserHandler = toggleSelectedUser(props);
</script>

<template>
	<ChannelRoomComponent
		:can-edit-topic="canEditTopic"
		:me="$me"
		:messages="room.messages"
		:name="room.name"
		:users="room.users"
		:selected-user="selectedUser"
		:topic="room.topic"
		@close-room="closeRoomHandler"
		@ignore-user="ignoreUserHandler"
		@unignore-user="unignoreUserHandler"
		@open-private="openPrivateHandler"
		@select-user="toggleSelectedUserHandler"
		@send-message="sendMessageHandler"
		@update-topic="updateTopicHandler"
	/>
</template>
