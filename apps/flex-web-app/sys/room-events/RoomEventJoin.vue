<script setup lang="ts">
import { computeHostname } from "./RoomEvent.state";

// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"JOIN">;
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
