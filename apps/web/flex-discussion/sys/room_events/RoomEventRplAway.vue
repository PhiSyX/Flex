<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

import { computed } from "vue";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data } = defineProps<Props<"RPL_AWAY">>();

const message = computed(() =>
	data.message.slice(data.nick.length + " :".length),
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p>
		* <span>{{ data.nick }}</span> est absent:
		<q>{{ message }}</q>
	</p>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

p {
	color: var(--color-grey400);
}

span {
	color: var(--default-text-color);
}
</style>
