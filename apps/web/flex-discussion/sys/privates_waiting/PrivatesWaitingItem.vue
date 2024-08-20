<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat";

import { format_date } from "@phisyx/flex-date";

import { computed } from "vue";
import Avatar from "../avatar/Avatar.vue";
import PrivateNick from "../private_nick/PrivateNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	priv: PrivateRoom;
}

interface Emits
{
	// biome-ignore lint/style/useShorthandFunctionType: chut
	(event_name: "open-private", priv: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let lastMessageDate = computed(() => {
	let time = props.priv.last_message
		.map((msg) => new Date(msg.time.datetime))
		.unwrap_or(props.priv.created_at);
	return format_date("H:i:s", time);
});

let lastMessage = computed(() => {
	return props.priv.last_message.map((msg) => msg.message).unwrap_or("");
});

let user = computed(() =>
	props.priv.get_participant_unchecked(props.priv.id())
);
let open_private_title_attribute = computed(() => {
	return `Ouvrir le privé de ${user.value.nickname}.`;
});

// ------- //
// Handler //
// ------- //

const open_private_handler = (priv: Origin) => emit("open-private", priv);
</script>

<template>
	<li class="[ pos-r ]">
		<Avatar :id="user.id" size="6" style="contain: size" />
		<PrivateNick
			:nickname="user.nickname"
			:is-current-client="user.is_current_client"
			class="[ pt=1 ]"
		/>
		<time>{{ lastMessageDate }}</time>
		<p>{{ lastMessage }}</p>
		<a
			@click.prevent="open_private_handler(user)"
			:id="user.id"
            :title="open_private_title_attribute"
			class="[ pos-a:full ]"
		>{{ open_private_title_attribute }}</a>
	</li>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

li {
	display: grid;
	grid-template-columns: fx.space(7) 1fr auto;
	column-gap: fx.space(1);
}

time {
	color: var(--color-grey500);
}

p {
	margin: 0;
	grid-column: 2;
}

a {
    color: transparent;
    user-select: none;
	cursor: pointer;
}
</style>
