<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"KICK">;
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
		* Kicks:
		<span>{{ data.knick.nickname }}</span>
		a été sanctionné par
		<span>{{ data.origin.nickname }}</span>
		(Raison: <output>{{ data.reason }}</output
		>)
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-red300);
}

output,
span {
	color: var(--default-text-color);
}

output {
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
