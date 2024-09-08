<script setup lang="ts">
import { type Props, computeHostname } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data } = defineProps<Props<"JOIN">>();

const hostname = computeHostname(data.origin);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p v-if="is_current_client">
		<strong><span>Tu</span></strong> as rejoint le salon
		<span>{{ data.channel }}</span>
	</p>
	<p v-else>
		* Joins: <span>{{ data.origin.nickname }}</span> (<span>{{
			data.origin.ident
		}}</span
		>@<span>{{ hostname }}</span
		>)
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--room-event-join-color);
}

span {
	color: var(--default-text-color);
}
</style>
