<script setup lang="ts">
import {
	type Props,
	compute$me,
	computeSelectedUser,
	computeCanEditTopic,
	myNick,
} from "./ChannelRoom.state";

import {
	changeNickRequestHandler,
	closeRoomHandler,
	ignoreUserHandler,
	joinChannelHandler,
	kickUser,
	openPrivateHandler,
	sendMessageHandler,
	sendSetAccessLevel,
	sendUnsetAccessLevel,
	toggleSelectedUser,
	topicModeHandler,
	unignoreUserHandler,
	updateTopicHandler,
} from "./ChannelRoom.handlers";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";
import ChannelRoomKicked from "#/sys/channel-room-kicked/ChannelRoomKicked.vue";

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
		:input-history="room.inputHistory"
		:me="$me"
		:current-nick="myNick"
		:messages="room.messages"
		:name="room.name"
		:users="room.users"
		:selected-user="selectedUser"
		:topic="room.topic"
		@change-nick-request="changeNickRequestHandler"
		@close-room="closeRoomHandler"
		@ignore-user="ignoreUserHandler"
		@kick-user="kickUserHandler"
		@open-private="openPrivateHandler"
		@select-user="toggleSelectedUserHandler"
		@send-message="sendMessageHandler"
		@set-access-level="sendSetAccessLevelHandler"
		@topic-mode="topicModeHandler"
		@unignore-user="unignoreUserHandler"
		@unset-access-level="sendUnsetAccessLevelHandler"
		@update-topic="updateTopicHandler"
	>
		<template v-if="room.kicked" #history>
			<ChannelRoomKicked
				:last-message="room.lastMessage.unwrap()"
				@join-channel="joinChannelHandler"
			/>
		</template>
	</ChannelRoomComponent>
</template>
