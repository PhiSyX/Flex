<script lang="ts" setup>
// ---- //
// Type //
// ---- //

interface Props {
	data: { origin: Origin; text: string };
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

defineProps<Props>();
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* Query:
		{{ data.origin.nickname }}

		(<span>{{ data.text }}</span
		>)
	</p>
</template>

<style scoped>
p {
	color: var(--room-event-query-color);
}

span {
	color: var(--default-text-color);
}
</style>
