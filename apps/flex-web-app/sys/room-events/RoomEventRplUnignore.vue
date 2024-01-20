<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"RPL_IGNORE">;
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
	<p v-for="user of data.users">
		* <span>{{ user.nickname }}</span> n'est désormais
		<strong>plus ignoré</strong>.
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
