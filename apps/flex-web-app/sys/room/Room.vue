<script setup lang="ts">
import {
	type Emits,
	changeNickRequest,
	openPrivate,
	sendMessage,
	dblclickMain,
} from "./Room.handler";
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

const changeNickRequestHandler = changeNickRequest(emit);
const dblclickMainHandler = dblclickMain(emit);
const openPrivateHandler = openPrivate(emit);
const sendMessageHandler = sendMessage(emit);
</script>

<template>
	<slot name="room-info" />
	<div class="room/area [ flex:full ov:a flex! ]">
		<RoomTopic>
			<template #topic>
				<slot name="topic" />
			</template>
			<template #topic-action>
				<slot name="topic-action" />
			</template>
		</RoomTopic>

		<slot name="after-topic-before-main" />

		<div
			class="room/main [ flex:full ov:h flex h:full ]"
			@dblclick="dblclickMainHandler"
		>
			<slot name="before-history" />
			<slot name="history">
				<RoomHistoryLogs
					:messages="messages"
					class="[ flex:full ]"
					@open-private="openPrivateHandler"
				/>
			</slot>
			<slot name="after-history" />
		</div>

		<RoomEditbox
			v-if="displayInput"
			:completion-list="completionList"
			:disable-input="disableInput"
			:history="inputHistory"
			:nick="nick"
			:placeholder="inputPlaceholder"
			:target="name"
			@change-nick-request="changeNickRequestHandler"
			@submit="sendMessageHandler"
		/>
	</div>
</template>
