<script setup lang="ts">
import { computed, ref } from "vue";
import { RoomMessage } from "~/room/RoomMessage";

// ---- //
// Type //
// ---- //
interface Props {
	lastMessage: RoomMessage;
}

interface Emits {
	(evtName: "join-channel", channelName: string): void;
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const displayJoinButton = ref(true);

const lastMessage = computed(
	() => props.lastMessage as RoomMessage & { data: GenericReply<"KICK"> }
);
const nickname = computed(() => lastMessage.value.data.origin.nickname);
const channel = computed(() => lastMessage.value.data.channel);
const reason = computed(() => lastMessage.value.data.reason);

function joinChannelHandler() {
	emit("join-channel", lastMessage.value.data.channel);
}
</script>

<template>
	<div class="channel/kicked">
		<p>
			Vous avez été sanctionné par
			<strong>{{ nickname }}</strong>
			du salon {{ channel }} pour la raison suivante «
			<strong>{{ reason }}</strong> » !
		</p>

		<button v-if="displayJoinButton" @click="joinChannelHandler">
			Rejoindre le salon
		</button>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/kicked") {
	flex-grow: 1;

	display: flex;
	flex-direction: column;
	place-content: center;
	place-items: center;

	padding-inline: fx.space(3);

	@include fx.theme using ($name) {
		@if $name == dark {
			background-color: var(--color-grey900);
		}
	}
}

p {
	color: var(--color-red400);
	font-variant: small-caps;
}

button {
	padding: fx.space(1);
	border-radius: 4px;
	cursor: pointer;

	@include fx.theme using ($name) {
		@if $name == light {
			background-color: var(--color-grey900);
			color: var(--color-grey50);
		} @else if $name == dark {
			background-color: var(--color-grey50);
			color: var(--color-grey900);
		}
	}
}
</style>
