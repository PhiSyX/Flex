<script setup lang="ts">
import type { Props } from './RoomEvent.state';

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"RPL_NOTOPIC">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p>* {{ data.message }}</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-green400);
}

q,
strong,
span {
	color: var(--default-text-color);
}
</style>
