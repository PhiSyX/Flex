<script setup lang="ts">
import { computed } from "vue";

import { Room } from "~/room/Room";

import RoomTopic from "#/sys/room-topic/RoomTopic.vue";
import RoomHistoryLogs from "#/sys/room-history-logs/RoomHistoryLogs.vue";
import RoomEditbox from "#/sys/room-editbox/RoomEditbox.vue";

// ---- //
// Type //
// ---- //

export interface Props {
	completionList?: Array<string>;
	displayInput?: boolean;
	disableInput?: boolean;
	room: Room;
	currentClientNickname?: string;
}

interface Emits {
	(evtName: "change-nickname", event: MouseEvent): void;
	(evtName: "dblclick-main", event: MouseEvent): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "send-message", message: string): void;
}

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
		? `La chambre « ${props.room.name} » est en mode lecture uniquement.`
		: "Commencez à taper / pour obtenir la liste des commandes disponibles...";
});

const changeNick = (event: MouseEvent) => emit("change-nickname", event);
const dblclickMain = (evt: MouseEvent) => emit("dblclick-main", evt);
const openPrivate = (origin: Origin) => emit("open-private", origin);
const sendMessage = (message: string) => emit("send-message", message);
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
			@dblclick="dblclickMain"
		>
			<slot name="before-history" />
			<slot name="history">
				<RoomHistoryLogs
					:messages="room.messages"
					class="[ flex:full ]"
					@open-private="openPrivate"
				/>
			</slot>
			<slot name="after-history" />
		</div>

		<RoomEditbox
			v-if="displayInput"
			:completion-list="completionList"
			:disable-input="disableInput"
			:current-client-nickname="currentClientNickname"
			:placeholder="inputPlaceholder"
			:room="room"
			@change-nickname="changeNick"
			@submit="sendMessage"
		/>
	</div>
</template>
