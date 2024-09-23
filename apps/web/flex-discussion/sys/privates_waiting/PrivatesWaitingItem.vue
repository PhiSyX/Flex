<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat/private/room";

import { format_date } from "@phisyx/flex-date";
import { computed } from "vue";

import Avatar from "#/api/avatar/Avatar.vue";
import PrivateNick from "../private_nick/PrivateNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	priv: PrivateRoom;
}

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: chut
	(event_name: "open-private", priv: Origin): void;
}

// --------- //
// Composant //
// --------- //

const { priv } = defineProps<Props>();
const emit = defineEmits<Emits>();

let lastMessageDate = computed(() => {
	let time = priv.last_message
		.map((msg) => new Date(msg.time.datetime))
		.unwrap_or(priv.created_at);
	return format_date("H:i:s", time);
});

let lastMessage = computed(() => {
	return priv.last_message.map((msg) => msg.message).unwrap_or("");
});

let user = computed(() => priv.get_participant_unchecked(priv.id()));
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
		<PrivateNick :participant="user" class="[ pt=1 ]" />
		<time>{{ lastMessageDate }}</time>
		<p>{{ lastMessage }}</p>
		<a
			@click.prevent="open_private_handler(user)"
			:id="user.id"
			:title="open_private_title_attribute"
			class="[ pos-a:full select:none cursor:pointer ]"
		>
			{{ open_private_title_attribute }}
		</a>
	</li>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

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
}
</style>
