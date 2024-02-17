<script setup lang="ts">
import { type Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"KICK">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* Kicks:
		<span>{{ data.knick.nickname }}</span>
		a été sanctionné par
		<span>{{ data.origin.nickname }}</span>
		(Raison: <q>{{ data.reason }}</q>)
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--room-event-kick-color);
}

span {
	color: var(--default-text-color);
}
</style>
