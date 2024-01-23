<script setup lang="ts">
import {
	compute$me,
	computeSelectedUser,
	computeCanEditTopic,
	type Props,
} from "./ChannelRoom.state";

import {
	closeRoomHandler,
	ignoreUserHandler,
	kickUser,
	openPrivateHandler,
	sendMessageHandler,
	sendSetAccessLevel,
	sendUnsetAccessLevel,
	toggleSelectedUser,
	unignoreUserHandler,
	updateTopicHandler,
} from "./ChannelRoom.handlers";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const $me = compute$me(props);
const selectedUser = computeSelectedUser(props);
const canEditTopic = computeCanEditTopic(props);

const kickUserHandler = kickUser(props);
const sendSetAccessLevelHandler = sendSetAccessLevel(props);
const sendUnsetAccessLevelHandler = sendUnsetAccessLevel(props);
const toggleSelectedUserHandler = toggleSelectedUser(props);
</script>

<template>
	<ChannelRoomComponent
		:can-edit-topic="canEditTopic"
		:disable-input="room.kicked"
		:me="$me"
		:messages="room.messages"
		:name="room.name"
		:users="room.users"
		:selected-user="selectedUser"
		:topic="room.topic"
		@close-room="closeRoomHandler"
		@ignore-user="ignoreUserHandler"
		@kick-user="kickUserHandler"
		@open-private="openPrivateHandler"
		@select-user="toggleSelectedUserHandler"
		@send-message="sendMessageHandler"
		@set-access-level="sendSetAccessLevelHandler"
		@unignore-user="unignoreUserHandler"
		@unset-access-level="sendUnsetAccessLevelHandler"
		@update-topic="updateTopicHandler"
	/>
</template>
