<script setup lang="ts">
import type { Room } from "@phisyx/flex-chat";

import { computed } from "vue";

import RoomEditbox from "#/sys/room_editbox/RoomEditbox.template.vue";
import RoomHistoryLogs from "#/sys/room_history_logs/RoomHistoryLogs.template.vue";
import RoomTopic from "#/sys/room_topic/RoomTopic.template.vue";

// ---- //
// Type //
// ---- //

export interface Props
{
	completionList?: Array<string>;
	displayInput?: boolean;
	disableInput?: boolean;
	room: Room;
	currentClientNickname?: string;
}

interface Emits
{
	(event_name: "change-nickname", event: MouseEvent): void;
	(event_name: "dblclick-main", event: MouseEvent): void;
	(event_name: "open-room", room_id: RoomID): void;
	(event_name: "open-private", origin: Origin): void;
	(event_name: "send-message", message: string): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	displayInput: true,
	disableInput: false,
});
const emit = defineEmits<Emits>();

let input_placeholder = computed(
	() => props.disableInput
		? `La chambre « ${props.room.name} » est en mode lecture uniquement.`
		: "Commencez à taper / pour obtenir la liste des commandes disponibles..."
);

// ------- //
// Handler //
// ------- //

const change_nick_handler = (event: MouseEvent) => emit("change-nickname", event);
const dblclick_main_handler = (evt: MouseEvent) => emit("dblclick-main", evt);
const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
const open_private_handler = (origin: Origin) => emit("open-private", origin);
const send_message_handler = (message: string) => emit("send-message", message);
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

		<div class="room/main [ flex:full ov:h flex h:full ]">
			<slot name="before-history" />
			<slot name="history">
				<RoomHistoryLogs
					:messages="room.messages"
					class="[ flex:full ]"
					@open-private="open_private_handler"
					@open-room="open_room_handler"
					@dblclick="dblclick_main_handler"
				/>
			</slot>
			<slot name="after-history" />
		</div>

		<RoomEditbox
			v-if="displayInput"
			:completion-list="completionList"
			:disable-input="disableInput"
			:current-client-nickname="currentClientNickname"
			:placeholder="input_placeholder"
			:room="room"
			@change-nickname="change_nick_handler"
			@submit="send_message_handler"
		/>
	</div>
</template>
