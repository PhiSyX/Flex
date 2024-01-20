<script setup lang="ts">
import Room from "#/sys/room/Room.vue";
import { ButtonIcon, UiButton } from "@phisyx/flex-uikit";

import {
	closeRoom,
	sendMessage,
	toggleIgnoreUser,
	type Emits,
} from "./PrivateRoom.handler";
import {
	Props,
	computeIsMe,
	computeTitleIgnoreButton,
} from "./PrivateRoom.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const closeRoomHandler = closeRoom(emit);
const sendMessageHandler = sendMessage(emit, props.recipient.nickname);
const toggleIgnoreUserHandler = toggleIgnoreUser(emit, props);

const isMe = computeIsMe(props);
const titleIgnoreButton = computeTitleIgnoreButton(props);
</script>

<template>
	<div class="room/private" :data-room="recipient.nickname">
		<Room
			:disable-input="disableInput"
			:messages="messages"
			:name="recipient.nickname"
			@send-message="sendMessageHandler"
		>
			<template #topic>
				<p>Discussion privée avec {{ recipient.nickname }}</p>
			</template>

			<template #topic-action>
				<UiButton
					v-if="!isMe"
					icon="user-block"
					:selected="disableInput"
					:false-value="false"
					:true-value="true"
					:title="titleIgnoreButton"
					@click="toggleIgnoreUserHandler()"
				/>
				<ButtonIcon
					icon="close"
					@click="closeRoomHandler(recipient.nickname)"
				/>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/private") {
	display: flex;

	@include fx.class("room/topic") {
		p {
			display: flex;
			place-content: center;
			place-items: center;
			margin-block: 0;
			height: 100%;
			user-select: none;
		}
	}

	@include fx.class("room/editbox") {
		background-color: var(--body-bg);
	}
}
</style>
