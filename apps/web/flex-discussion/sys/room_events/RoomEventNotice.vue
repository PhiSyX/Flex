<script setup lang="ts">
import { computed } from "vue";

import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data, is_current_client } = defineProps<Props<"NOTICE">>();

const target = computed(() =>
	!data.target.startsWith("#")
		? is_current_client
			? data.target
			: data.origin.nickname
		: `${data.origin.nickname}:${data.target}`
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<span v-if="is_current_client">&ndash;&gt;</span>
	<span v-else>&lt;&ndash;</span>
	<p>
		-<strong>{{ target }}</strong
		>- {{ message }}
	</p>
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
