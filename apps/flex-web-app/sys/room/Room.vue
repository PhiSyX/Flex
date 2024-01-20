<script setup lang="ts">
import { Emits, openPrivate, sendMessage } from "./Room.handler";
import { type Props, computeInputPlaceholder } from "./Room.state";

import RoomTopic from "#/sys/room-topic/RoomTopic.vue";
import RoomHistoryLogs from "#/sys/room-history-logs/RoomHistoryLogs.vue";
import RoomEditbox from "#/sys/room-editbox/RoomEditbox.vue";

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	displayInput: true,
	disableInput: false,
});
const emit = defineEmits<Emits>();

const inputPlaceholder = computeInputPlaceholder(props);
const openPrivateHandler = openPrivate(emit);
const sendMessageHandler = sendMessage(emit);
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

<style scoped lang="scss">
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
