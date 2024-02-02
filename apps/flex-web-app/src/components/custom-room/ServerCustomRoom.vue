<script setup lang="ts">
import { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";

import ServerCustomRoomComponent from "#/sys/server-custom-room/ServerCustomRoom.vue";

import { forumURL, myNick, vademecumURL } from "./ServerCustomRoom.state";
import {
	changeNickRequestHandler,
	sendMessageHandler,
} from "./ServerCustomRoom.handlers";

// ---- //
// Type //
// ---- //

interface Props {
	room: ServerCustomRoom;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<ServerCustomRoomComponent
		v-if="room.isActive() && !room.isClosed()"
		:forum-url="forumURL"
		:current-nick="myNick"
		:id="room.id()"
		:input-history="room.inputHistory"
		:messages="room.messages"
		:name="room.name"
		:vademecum-url="vademecumURL"
		class="[ flex:full ]"
		@change-nick-request="changeNickRequestHandler"
		@send-message="sendMessageHandler"
	/>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;
</style>
