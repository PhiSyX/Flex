<script setup lang="ts">
import { computeHostname } from "./RoomEvent.state";

import type { Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data } = defineProps<Props<"QUIT">>();

const hostname = computeHostname(data.origin);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p>
		* Quits: <span>{{ data.origin.nickname }}</span> (<span>{{
			data.origin.ident
		}}</span
		>@<span>{{ hostname }}</span
		>)
		<em v-if="data.message">
			(<q>{{ data.message }}</q
			>)</em
		>
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
