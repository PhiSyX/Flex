<script setup lang="ts">
import { computed } from "vue";

import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"RPL_AWAY">>();

const message = computed(() =>
	props.data.message.slice(props.data.nick.length + " :".length),
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* <span>{{ data.nick }}</span> est absent:
		<q>{{ message }}</q>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-grey400);
}

span {
	color: var(--default-text-color);
}
</style>
