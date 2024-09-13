<script setup lang="ts">
import type { RoomMessage } from "@phisyx/flex-chat";

import { onActivated as on_activated, ref } from "vue";

import RoomMessageComponent from "#/sys/room_message/RoomMessage.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	messages: Array<RoomMessage>;
}

interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "open-room", room_id: RoomID): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

let $root = ref<HTMLElement>();
let container_needs_scroll = ref(true);

// --------- //
// Lifecycle // -> Hooks
// --------- //

on_activated(() => scroll());

// ------- //
// Handler //
// ------- //

const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);

function scroll_handler() {
	if (!$root.value) {
		return;
	}

	container_needs_scroll.value =
		$root.value.clientHeight + $root.value.scrollTop + 150 >=
		$root.value.scrollHeight;

	scroll_to_bottom();
}

function scroll_to_bottom() {
	if (container_needs_scroll.value) {
		scroll();
	}
}

function scroll() {
	if (!$root.value) {
		return;
	}

	$root.value.scrollTop = $root.value.scrollHeight;
}
</script>

<template>
	<div ref="$root" class="[ ov:y flex! ]">
		<ul class="[ list:reset flex:full flex! align-jc:end gap=1 p=1 ]">
			<RoomMessageComponent
				v-for="message in messages"
				:key="message.id"
				:message="message"
				@vue:mounted="scroll_handler"
				@open-room="open_room_handler"
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
