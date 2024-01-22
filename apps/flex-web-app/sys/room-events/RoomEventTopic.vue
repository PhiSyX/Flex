<script setup lang="ts">
import { format_date } from "@phisyx/flex-date";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	data: GenericReply<"RPL_TOPIC">;
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

const updatedAt = computed(() => {
	return format_date("d/m/Y à H:i:s", new Date(props.data.updated_at));
});
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p v-if="data.updated">
		<span v-if="isMe">
			<b>Vous</b> avez mis à jour le sujet du salon {{ data.channel }}:
			<output>{{ data.topic }}</output>
		</span>
		<span v-else>
			* Topic: <span>{{ data.updated_by }}</span> a mis à jour le sujet du
			salon: <output>{{ data.topic }}</output>
		</span>
	</p>
	<p v-else>
		* Topic: <output>{{ data.topic }}</output> par {{ data.updated_by }} le
		<time :datetime="time.datetime">{{ updatedAt }}</time>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--color-green400);
}

span {
	color: var(--default-text-color);
}

output {
	color: var(--default-text-color);
	&::before {
		content: "« ";
	}
	&::after {
		content: " »";
	}
}
</style>
