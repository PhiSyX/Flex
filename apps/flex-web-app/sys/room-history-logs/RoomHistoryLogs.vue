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
	(evtName: "select-nick", nickname: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

let $root = ref();

let containerNeedsScroll = ref(true);

function selectNickHandler(nickname: string) {
	emit("select-nick", nickname);
}

function scrollToBottom() {
	if (containerNeedsScroll.value) scroll();
}

function scroll() {
	$root.value.scrollTop = $root.value.scrollHeight;
}

function scrollHandler() {
	containerNeedsScroll.value =
		$root.value.clientHeight + $root.value.scrollTop + 50 >=
		$root.value.scrollHeight;
	scrollToBottom();
}

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
