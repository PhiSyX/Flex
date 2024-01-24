<script setup lang="ts">
import { type Props, computeHostname } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"PART">>();

const hostname = computeHostname(props.data.origin);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* Parts: <span>{{ data.origin.nickname }}</span> (<span>{{
			data.origin.ident
		}}</span
		>@<span>{{ hostname }}</span
		>) <em v-if="data.message">(<span>{{ data.message }}</span>)</em>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-grey500);
}

span {
	color: var(--default-text-color);
}
</style>
