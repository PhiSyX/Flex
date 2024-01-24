<script setup lang="ts">
import { onActivated } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

import { $root } from "./RoomHistoryLogs.state";
import { scrollHandler, scroll } from "./RoomHistoryLogs.handlers";

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
