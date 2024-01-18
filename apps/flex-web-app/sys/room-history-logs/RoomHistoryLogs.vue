<script setup lang="ts">
import { onActivated } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

import { $root } from "./RoomHistoryLogs.state";
import {
	type Emits,
	selectNick,
	scrollHandler,
	scroll,
} from "./RoomHistoryLogs.handlers";

import RoomMessageComponent from "#/sys/room-message/RoomMessage.vue";

// ---- //
// Type //
// ---- //

interface Props {
	messages: Array<RoomMessage>;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const selectNickHandler = selectNick(emit);

onActivated(() => scroll());
</script>

<template>
	<div ref="$root">
		<ul class="[ list:reset ]">
			<RoomMessageComponent
				v-for="message in messages"
				:key="message.id"
				v-bind="message"
				@select-nick="selectNickHandler"
				@vue:mounted="scrollHandler"
			/>
		</ul>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

div {
	overflow: hidden;
	overflow-y: auto !important;
	overscroll-behavior-y: contain;
	scroll-snap-type: y mandatory;

	display: flex;
	flex-direction: column;
	border-bottom-left-radius: 4px;
	background: var(--room-bg);
}

ul {
	flex-grow: 1;

	display: flex;
	flex-direction: column;
	justify-content: end;
	gap: fx.space(1);
	padding: fx.space(1);
}
</style>
