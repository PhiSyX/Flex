<script setup lang="ts">
import { computed } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

import RoomTopic from "#/sys/room-topic/RoomTopic.vue";
import RoomHistoryLogs from "#/sys/room-history-logs/RoomHistoryLogs.vue";
import RoomEditbox from "#/sys/room-editbox/RoomEditbox.vue";

// ---- //
// Type //
// ---- //

interface Props {
	displayInput?: boolean;
	disableInput?: boolean;
	name: string;
	messages: Array<RoomMessage>;
}

type Emits = {
	(evtName: "open-private", nickname: string): void;
	(evtName: "select-nick", nickname: string): void;
	(evtName: "send-message", message: string): void;
};

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	displayInput: true,
	disableInput: false,
});
const emit = defineEmits<Emits>();

const inputPlaceholder = computed(() => {
	return props.disableInput
		? `La chambre « ${props.name} » est en mode lecture uniquement.`
		: "Commencez à taper / pour obtenir la liste des commandes disponibles...";
});

// -------- //
// Handlers //
// -------- //

function openPrivateHandler(nickname: string) {
	emit("open-private", nickname);
}

function selectNickHandler(nickname: string) {
	emit("select-nick", nickname);
}

function sendMessageHandler(message: string) {
	emit("send-message", message);
}
</script>

<template>
	<slot name="room-info" />
	<div class="room/area">
		<RoomTopic>
			<template #topic>
				<slot name="topic" />
			</template>
			<template #topic-action>
				<slot name="topic-action" />
			</template>
		</RoomTopic>

		<slot name="after-topic-before-main" />

		<div class="room/main">
			<slot name="before-history" />
			<slot name="history">
				<RoomHistoryLogs
					:messages="messages"
					class="room/history-logs"
					@open-private="openPrivateHandler"
					@select-nick="selectNickHandler"
				/>
			</slot>
			<slot name="after-history" />
		</div>

		<RoomEditbox
			v-if="displayInput"
			:disable-input="disableInput"
			:target="name"
			:placeholder="inputPlaceholder"
			@submit="sendMessageHandler"
		/>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

@include fx.class("room/area") {
	flex-grow: 1;

	overflow: auto;
	display: flex;
	flex-direction: column;
}

@include fx.class("room/main") {
	flex-grow: 1;
	overflow: hidden;
	display: flex;
	height: 100%;
}

@include fx.class("room/history-logs") {
	flex-grow: 1;
}
</style>
