<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"NICK">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p>
		<span>{{ data.old_nickname }}</span> est désormais connu sous le nom de
		<span>{{ data.new_nickname }}</span>
	</p>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

p {
	color: var(--room-event-nick-color);
}

span {
	color: var(--default-text-color);
}
</style>
