<script setup lang="ts">
import { computed } from "vue";

import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"NOTICE">>();

const target = computed(() =>
	!props.data.target.startsWith("#")
		? props.isCurrentClient
			? props.data.target
			: props.data.origin.nickname
		: `${props.data.origin.nickname}:${props.data.target}`,
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<span v-if="isCurrentClient">&ndash;&gt;</span>
	<span v-else>&lt;&ndash;</span>
	<p>-<strong>{{ target }}</strong>- {{ message }}</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--room-event-nick-color);
	font-style: italic;
}

strong {
	font-style: normal;
	color: var(--room-event-notice-color);
}
</style>
