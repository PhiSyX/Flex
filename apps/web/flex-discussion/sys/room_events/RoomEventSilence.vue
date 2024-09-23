<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props<"SILENCE">>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p v-for="user of data.users">
		<template v-if="data.added">
			* <span>{{ user.nickname }}</span> est désormais
			<strong>ignoré</strong>.
		</template>
		<template v-else-if="data.removed">
			* <span>{{ user.nickname }}</span> n'est désormais
			<strong>plus ignoré</strong>.
		</template>
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
