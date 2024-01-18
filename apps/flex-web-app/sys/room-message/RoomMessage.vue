<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	data: object;
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

interface Emits {
	(evtName: "open-private", nickname: string): void;
	(evtName: "select-nick", nickname: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

// -------- //
// Handlers //
// -------- //

// function openPrivateHandler(nickname: string) {
// 	emit("open-private", nickname);
// }

// function selectNickHandler(nickname: string) {
// 	emit("select-nick", nickname);
// }
</script>

<template>
	<li :data-type="type" :data-myself="isMe">
		<time :datetime="time.datetime">
			{{ time.formattedTime }}
		</time>

		<p>{{ message }}</p>
	</li>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

li {
	display: inline-block;

	&[data-type="action"] {
		font-style: italic;
		color: var(--room-message-action-color);
	}

	&[data-type*="error"] {
		cursor: default;
		font-style: italic;
		color: var(--room-message-error-color);
	}

	> *:not(:last-child) {
		margin-right: fx.space(1);
	}
}

time {
	cursor: default;
	color: var(--room-message-time-color);
}

p {
	display: inline;
	line-height: 1.4rem;
	word-break: break-all;
	hyphens: manual;
}
</style>
