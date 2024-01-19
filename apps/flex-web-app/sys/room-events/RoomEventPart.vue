<script setup lang="ts">
import { computeHostname } from "./RoomEvent.state";

// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"PART">;
	id: string;
	message: string;
	isMe: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formattedTime: string;
	};
	type:
		| "action"
		| `error:${string}`
		| "event"
		| `event:${string}`
		| "privmsg";
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();

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
