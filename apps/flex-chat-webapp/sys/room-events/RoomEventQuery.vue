<script lang="ts" setup>
import type { Props } from "./RoomEvent.state";

// ---- //
// Type //
// ---- //

type PropsQuery = Props<RepliesNames> & {
	data: { origin: Origin; text: string };
};

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<PropsQuery>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* Query:
		{{ data.origin.nickname }}

		(<span>{{ data.text }}</span
		>)
	</p>
</template>

<style scoped>
p {
	color: var(--room-event-query-color);
}

span {
	color: var(--default-text-color);
}
</style>
