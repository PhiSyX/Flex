<script setup lang="ts">
import { onActivated, ref } from "vue";

import type { RoomMessage } from "@phisyx/flex-chat";

import RoomMessageComponent from "#/sys/room_message/RoomMessage.vue";

// ---- //
// Type //
// ---- //

interface Props {
	messages: Array<RoomMessage>;
}
interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(evtName: "open-room", roomName: RoomID): void;
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

const openRoom = (roomName: RoomID) => emit("open-room", roomName);

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
	border-radius: 4px;
	border-top-left-radius: 0;
	background: var(--room-bg);
}
</style>
