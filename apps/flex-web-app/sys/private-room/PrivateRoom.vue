<script setup lang="ts">
import Room from "#/sys/room/Room.vue";
import { ButtonIcon } from "@phisyx/flex-uikit";
import { RoomMessage } from "~/room/RoomMessage";
import { PrivateNick } from "~/private/PrivateNick";
import { closeRoom, sendMessage, type Emits } from "./PrivateRoom.handler";

// ---- //
// Type //
// ---- //

interface Props {
	me: PrivateNick;
	messages: Array<RoomMessage>;
	recipient: PrivateNick;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const closeRoomHandler = closeRoom(emit);
const sendMessageHandler = sendMessage(emit, props.recipient.nickname);
</script>

<template>
	<div class="room/private" :data-room="recipient.nickname">
		<Room
			:messages="messages"
			:name="recipient.nickname"
			@send-message="sendMessageHandler"
		>
			<template #topic>
				<p>Discussion privée avec {{ recipient.nickname }}</p>
			</template>

			<template #topic-action>
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
