<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"NICK">;
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
		<span>{{ data.old_nickname }}</span> est désormais connu sous le nom de
		<span>{{ data.new_nickname }}</span>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-light-blue600);
}

span {
	color: var(--default-text-color);
}
</style>
