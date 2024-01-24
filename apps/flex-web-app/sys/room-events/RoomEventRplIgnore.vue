<script setup lang="ts">
import { type Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"RPL_IGNORE">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p v-for="user of data.users">
		* <span>{{ user.nickname }}</span> est désormais
		<strong>ignoré</strong>.
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
