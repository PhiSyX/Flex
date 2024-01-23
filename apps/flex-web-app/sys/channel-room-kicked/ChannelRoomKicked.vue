<script setup lang="ts">
import { type Emits, joinChannel } from "./ChannelRoomKicked.handlers";

import {
	type Props,
	computeReason,
	computeChannel,
	computeNickname,
	displayJoinButton,
	toRawLastMessage,
} from "./ChannelRoomKicked.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const lastMessage = toRawLastMessage(props);

const nickname = computeNickname(props);
const channel = computeChannel(props);
const reason = computeReason(props);

const joinChannelHandler = joinChannel(emit, { lastMessage });
</script>

<template>
	<div class="channel/kicked">
		<p>
			Vous avez été sanctionné par
			<strong>{{ nickname }}</strong>
			du salon {{ channel }} pour la raison suivante «
			<strong>{{ reason }}</strong> » !
		</p>

		<button v-if="displayJoinButton" @click="joinChannelHandler()">
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
