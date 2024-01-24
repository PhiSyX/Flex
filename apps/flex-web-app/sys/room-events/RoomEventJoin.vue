<script setup lang="ts">
import { type Props, computeHostname } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"JOIN">>();

const hostname = computeHostname(props.data.origin);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p v-if="isMe">
		<strong><span>Vous</span></strong> avez rejoint le salon
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
