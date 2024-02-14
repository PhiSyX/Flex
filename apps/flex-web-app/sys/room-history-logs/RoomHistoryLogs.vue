<script setup lang="ts">
import { onActivated, ref } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

import RoomMessageComponent from "#/sys/room-message/RoomMessage.vue";

// ---- //
// Type //
// ---- //

interface Props {
	messages: Array<RoomMessage>;
}
interface Emits {
	(evtName: "open-room", roomName: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const $root = ref<HTMLElement>();
const containerNeedsScroll = ref(true);

// -------- //
// Fonction //
// -------- //

function scrollToBottom() {
	if (containerNeedsScroll.value) scroll();
}

function scroll() {
	if (!$root.value) {
		return;
	}
	$root.value.scrollTop = $root.value.scrollHeight;
}

// -------- //
// Handlers //
// -------- //

const openRoom = (roomName: string) => emit("open-room", roomName);

function scrollHandler() {
	if (!$root.value) {
		return;
	}

	containerNeedsScroll.value =
		$root.value.clientHeight + $root.value.scrollTop + 150 >=
		$root.value.scrollHeight;

	scrollToBottom();
}

onActivated(() => scroll());
</script>

<template>
	<div ref="$root" class="[ ov:y flex! ]">
		<ul class="[ list:reset flex:full flex! align-jc:end gap=1 p=1 ]">
			<RoomMessageComponent
				v-for="message in messages"
				:key="message.id"
				v-bind="message"
				@vue:mounted="scrollHandler"
				@open-room="openRoom"
			/>
		</ul>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

div {
	border-bottom-left-radius: 4px;
	background: var(--room-bg);
}
</style>
