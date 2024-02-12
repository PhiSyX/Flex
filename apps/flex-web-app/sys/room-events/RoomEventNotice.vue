<script setup lang="ts">
import { type Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"NOTICE">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>-<strong>{{ data.origin.nickname }}</strong>- {{ data.text }}</p>
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
