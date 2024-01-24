<script setup lang="ts">
import { format_date } from "@phisyx/flex-date";
import { computed } from "vue";

import { type Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"RPL_TOPIC">>();

const updatedAt = computed(() => {
	return format_date("d/m/Y à H:i:s", new Date(props.data.updated_at));
});
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p v-if="data.updated">
		<template v-if="isMe">
			<strong>Vous</strong> avez mis à jour le sujet du salon
			<span>{{ data.channel }}: </span> <output>{{ data.topic }}</output>
		</template>
		<template v-else>
			* Topic: <span>{{ data.updated_by }}</span> a mis à jour le sujet du
			salon: <output>{{ data.topic }}</output>
		</template>
	</p>
	<p v-else>
		* Topic: <output>{{ data.topic }}</output> par
		<span>{{ data.updated_by }}</span> le
		<time :datetime="time.datetime">{{ updatedAt }}</time>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-green400);
}

strong,
span {
	color: var(--default-text-color);
}

output {
	color: var(--default-text-color);
	&::before {
		content: "« ";
		color: var(--color-grey400);
	}
	&::after {
		content: " »";
		color: var(--color-grey400);
	}
}
</style>
